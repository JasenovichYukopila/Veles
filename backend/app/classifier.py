import random
import shutil
import joblib
import joblib
import numpy as np
import librosa
import tempfile
import os
import subprocess

from schemas import ClassificationResponse, Genre

GENRES: list[Genre] = [
    'Clásica',
    'Electrónica',
    'Hip-Hop',
    'Jazz',
    'Pop',
    'Rock',
    'Vallenato',
]

MODEL = None
SCALER = None
LABEL_ENCODER = None


def extract_features(y: np.ndarray, sr: int) -> np.ndarray:
    # --- Shared intermediates ---
    mfccs     = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    chroma    = librosa.feature.chroma_stft(y=y, sr=sr)
    y_harm, y_perc = librosa.effects.hpss(y)
    stft_mag  = np.abs(librosa.stft(y))

    # --- 47 base features (same as extraerfeatures in ETL notebook) ---
    tempo               = float(librosa.beat.tempo(y=y, sr=sr)[0])
    spectral_centroid   = float(librosa.feature.spectral_centroid(y=y, sr=sr).mean())
    spectral_bandwidth  = float(librosa.feature.spectral_bandwidth(y=y, sr=sr).mean())
    rolloff             = float(librosa.feature.spectral_rolloff(y=y, sr=sr).mean())
    zero_crossing_rate  = float(librosa.feature.zero_crossing_rate(y).mean())
    rms                 = float(librosa.feature.rms(y=y).mean())
    chroma_stft         = float(chroma.mean())
    onset_strength_mean = float(onset_env.mean())
    onset_strength_std  = float(onset_env.std())
    pitch_variance      = float(chroma.var())
    spectral_flux_std   = float(
        np.std(np.sum(np.diff(stft_mag, axis=1) ** 2, axis=0))
    )

    mfcc_means = [float(mfccs[i].mean()) for i in range(13)]
    mfcc_stds  = [float(mfccs[i].std())  for i in range(13)]

    harm_energy     = float(np.mean(np.abs(y_harm)))
    perc_energy     = float(np.mean(np.abs(y_perc)))
    harm_perc_ratio = harm_energy / (perc_energy + 1e-6)

    spectral_flatness_mean = float(librosa.feature.spectral_flatness(y=y).mean())

    tonnetz      = librosa.feature.tonnetz(y=y_harm, sr=sr)
    tonnetz_stds = [float(tonnetz[i].std()) for i in range(6)]

    _, beats = librosa.beat.beat_track(y=y, sr=sr)
    if len(beats) > 1:
        intervals = np.diff(librosa.frames_to_time(beats, sr=sr))
        tempo_cv  = float(np.std(intervals) / (np.mean(intervals) + 1e-6))
    else:
        tempo_cv = 0.0

    freqs       = librosa.fft_frequencies(sr=sr)
    bass_bins   = stft_mag[freqs < 250]
    treble_bins = stft_mag[freqs > 2000]
    if len(treble_bins) == 0:
        bass_ratio = float(np.mean(bass_bins)) if len(bass_bins) > 0 else 0.0
    else:
        bass_ratio = float(np.mean(bass_bins) / (np.mean(treble_bins) + 1e-6))

    # --- 18 engineered features (same as nuevas_features in training notebook) ---
    brightness_ratio         = rolloff / (spectral_centroid + 1e-6)
    centroid_bandwidth_ratio = spectral_centroid / (spectral_bandwidth + 1e-6)
    rolloff_bandwidth_ratio  = rolloff / (spectral_bandwidth + 1e-6)
    zcr_centroid_ratio       = zero_crossing_rate / (spectral_centroid + 1e-6)
    rms_onset_ratio          = rms / (onset_strength_mean + 1e-6)

    mm = np.array(mfcc_means)
    mfcc_mean_mean  = float(mm.mean())
    mfcc_mean_std   = float(mm.std())
    mfcc_mean_max   = float(mm.max())
    mfcc_mean_min   = float(mm.min())
    mfcc_mean_range = mfcc_mean_max - mfcc_mean_min

    ms = np.array(mfcc_stds)
    mfcc_std_mean  = float(ms.mean())
    mfcc_std_std   = float(ms.std())
    mfcc_std_max   = float(ms.max())
    mfcc_std_min   = float(ms.min())
    mfcc_std_range = mfcc_std_max - mfcc_std_min

    ts = np.array(tonnetz_stds)
    tonnetz_mean_std = float(ts.mean())
    tonnetz_std_std  = float(ts.std())

    tempo_bass_ratio = tempo * bass_ratio

    # Column order matches training dataset (CSV columns + nuevas_features columns)
    features = [
        tempo, spectral_centroid, spectral_bandwidth, rolloff,
        zero_crossing_rate, rms, chroma_stft,
        onset_strength_mean, onset_strength_std,
        pitch_variance, spectral_flux_std,
        *[val for i in range(13) for val in (mfcc_means[i], mfcc_stds[i])],
        harm_perc_ratio, spectral_flatness_mean,
        *tonnetz_stds,
        tempo_cv, bass_ratio,
        # engineered
        brightness_ratio, centroid_bandwidth_ratio, rolloff_bandwidth_ratio,
        zcr_centroid_ratio, rms_onset_ratio,
        mfcc_mean_mean, mfcc_mean_std, mfcc_mean_max, mfcc_mean_min, mfcc_mean_range,
        mfcc_std_mean, mfcc_std_std, mfcc_std_max, mfcc_std_min, mfcc_std_range,
        tonnetz_mean_std, tonnetz_std_std,
        tempo_bass_ratio,
    ]

    return np.array(features, dtype=np.float32)


def classify(audio_bytes: bytes) -> ClassificationResponse:
    ffmpeg_path = shutil.which('ffmpeg')
    if ffmpeg_path is None:
        raise RuntimeError(
            'ffmpeg no está instalado o no está en el PATH del sistema. '
            'Instálalo desde https://ffmpeg.org/download.html'
        )

    import time

    with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as tmp_in:
        tmp_in.write(audio_bytes)
        tmp_in_path = tmp_in.name

    tmp_out_path = tmp_in_path.replace('.webm', '.wav')

    try:
        t0 = time.time()
        subprocess.run(
            [ffmpeg_path, '-y', '-i', tmp_in_path, tmp_out_path],
            check=True,
            capture_output=True,
        )
        print(f"ffmpeg: {time.time() - t0:.2f}s")

        t1 = time.time()
        audio, sr = librosa.load(tmp_out_path, sr=None, mono=True)
        print(f"librosa.load: {time.time() - t1:.2f}s")

        t2 = time.time()
        features = extract_features(audio, sr)
        print(f"extract_features: {time.time() - t2:.2f}s")

    finally:
        os.unlink(tmp_in_path)
        if os.path.exists(tmp_out_path):
            os.unlink(tmp_out_path)

    genre, confidence = classify_genre(features)

    if confidence is None:
        confidence = 0.95

    confidence = round(confidence, 2)

    return ClassificationResponse(genre=genre, confidence=confidence)

def get_model():
    from huggingface_hub import login, snapshot_download
    from dotenv import load_dotenv

    load_dotenv()
    login(token=os.getenv("HF_TOKEN"))

    if os.path.exists("./models"):
        shutil.rmtree("./models")
    os.makedirs("./models")
    
    print("Descargando modelo desde Hugging Face...")
    snapshot_download(
        repo_id="F4-bit/ML-voting-classifier-UTB",
        local_dir="./models"
    )

def classify_genre(features: np.ndarray):
    global MODEL, SCALER, LABEL_ENCODER

    X = features.reshape(1, -1)
    X_scaled = SCALER.transform(X)

    pred = MODEL.predict(X_scaled)
    genre = LABEL_ENCODER.inverse_transform(pred)[0]

    confidence = None

    if hasattr(MODEL, "predict_proba"):
        probs = MODEL.predict_proba(X_scaled)[0]
        confidence = float(np.max(probs))

    return genre, confidence

def load_model():
    global MODEL, SCALER, LABEL_ENCODER

    MODEL = joblib.load("models/best_model.pkl")
    SCALER = joblib.load("models/scaler.pkl")
    LABEL_ENCODER = joblib.load("models/label_encoder.pkl")

def warmup() -> None:
    print("Calentando librosa...")
    noise = np.random.randn(22050).astype(np.float32) * 0.01
    extract_features(noise, 22050)
    print("Librosa listo.")
    print("Cargando modelo...")
    get_model()
    print("Modelo descargado. Cargando en memoria...")
    load_model()
    print("Modelo listo.")
    print("Backend listo.")
