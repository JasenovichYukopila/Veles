import { useState, useRef, useEffect } from 'react';
import './StageProcessing.css';

interface Props {
  audioBlob:     Blob | null;
  analysisReady: boolean;
  onContinue:    () => void;
}

export function StageProcessing({ audioBlob, analysisReady, onContinue }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef   = useRef<string | null>(null);

  useEffect(() => {
    if (audioBlob) {
      urlRef.current = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(urlRef.current);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [audioBlob]);

  // Stop playback when analysis finishes so the UI is calm
  useEffect(() => {
    if (analysisReady && isPlaying) {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [analysisReady]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="stage-processing">
      <div className="stage-processing__content">

        {/* Visual — animating bars while analyzing, checkmark when done */}
        <div className="stage-processing__visual">
          {analysisReady ? (
            <div className="stage-processing__check">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M11 18.5l5 5 9-10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <>
              <div className="stage-processing__bars">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="stage-processing__bar"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
              <div className="stage-processing__scanner" />
            </>
          )}
        </div>

        {/* Text */}
        <div className="stage-processing__text">
          <p className="stage-processing__label">
            {analysisReady ? 'Análisis completo' : 'Analizando audio'}
          </p>
          <p className="stage-processing__hint">
            {analysisReady
              ? '¿Qué quieres hacer?'
              : 'Identificando patrones espectrales'}
          </p>
        </div>

        {/* Actions — only shown when analysis is done */}
        {analysisReady && (
          <div className="stage-processing__actions">
            {audioBlob && (
              <button
                className={`stage-processing__play${isPlaying ? ' stage-processing__play--active' : ''}`}
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar grabación' : 'Escuchar grabación'}
              >
                <span className="stage-processing__play-icon">
                  {isPlaying ? (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                      <rect x="1.5" y="1" width="3.5" height="11" rx="1" />
                      <rect x="8"   y="1" width="3.5" height="11" rx="1" />
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                      <path d="M2.5 1.5l9 5-9 5V1.5z" />
                    </svg>
                  )}
                </span>
                {isPlaying ? 'Pausar' : 'Escuchar grabación'}
              </button>
            )}

            <button
              className="stage-processing__continue"
              onClick={onContinue}
            >
              Ver resultado
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
              </svg>
            </button>
          </div>
        )}

        {/* Listening hint while still analyzing */}
        {!analysisReady && audioBlob && (
          <button
            className="stage-processing__play stage-processing__play--subtle"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar grabación' : 'Escuchar grabación'}
          >
            <span className="stage-processing__play-icon">
              {isPlaying ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                  <rect x="1.5" y="1" width="3.5" height="11" rx="1" />
                  <rect x="8"   y="1" width="3.5" height="11" rx="1" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                  <path d="M2.5 1.5l9 5-9 5V1.5z" />
                </svg>
              )}
            </span>
            {isPlaying ? 'Pausar' : 'Escuchar grabación'}
          </button>
        )}

      </div>
    </section>
  );
}
