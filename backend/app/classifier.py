import random
import shutil
import numpy as np
import librosa
import io
import tempfile
import os
import subprocess

from app.schemas import ClassificationResponse, Genre

GENRES: list[Genre] = [
    'Clásica',
    'Electrónica',
    'Hip-Hop',
    'Jazz',
    'Pop',
    'Rock',
    'Vallenato',
]

def extract_features(audio: np.ndarray, sr: int) -> np.ndarray:
    mfccs         = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
    onset_env     = librosa.onset.onset_strength(y=audio, sr=sr)
    chroma        = librosa.feature.chroma_stft(y=audio, sr=sr)

    features = [
        librosa.beat.tempo(y=audio, sr=sr)[0],
        librosa.feature.spectral_centroid(y=audio, sr=sr).mean(),
        librosa.feature.spectral_bandwidth(y=audio, sr=sr).mean(),
        librosa.feature.spectral_rolloff(y=audio, sr=sr).mean(),
        librosa.feature.zero_crossing_rate(audio).mean(),
        librosa.feature.rms(y=audio).mean(),
        chroma.mean(),
        onset_env.mean(),
        onset_env.std(),
        chroma.var(),
        *[val for coef in mfccs for val in (coef.mean(), coef.std())],
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
        _ = extract_features(audio, sr)
        print(f"extract_features: {time.time() - t2:.2f}s")

    finally:
        os.unlink(tmp_in_path)
        if os.path.exists(tmp_out_path):
            os.unlink(tmp_out_path)

    genre      = random.choice(GENRES)
    confidence = round(random.uniform(0.60, 0.95), 2)

    return ClassificationResponse(genre=genre, confidence=confidence)

def warmup() -> None:
    print("Calentando librosa...")
    silent = np.zeros(22050, dtype=np.float32)
    extract_features(silent, 22050)
    print("Backend listo.")