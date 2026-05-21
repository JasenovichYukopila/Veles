import type { ClassificationResult } from '../../../types';
import { GENRE_INFO } from '../../../constants';
import './StageResult.css';

interface StageResultProps {
  result:     ClassificationResult;
  onContinue: () => void;
  onReset:    () => void;
}

export function StageResult({ result, onContinue, onReset }: StageResultProps) {
  const { genre, confidence } = result;
  const info                  = GENRE_INFO[genre];
  const confidencePercent     = Math.round(confidence * 100);

  return (
    <section className="stage-result">
      <div className="stage-result__watermark" aria-hidden="true">
        {genre}
      </div>

      <div className="stage-result__content">
        <span className="stage-result__label">Género detectado</span>

        <h2 className="stage-result__genre">{genre}</h2>

        <div className="stage-result__confidence">
          <div className="stage-result__bar">
            <div
              className="stage-result__bar-fill"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <span className="stage-result__confidence-value">
            {confidencePercent}% de confianza
          </span>
        </div>

        <p className="stage-result__description">{info.description}</p>

        <div className="stage-result__actions">
          <button className="stage-result__btn-primary" onClick={onContinue}>
            Ver canciones representativas
          </button>
          <button className="stage-result__btn-secondary" onClick={onReset}>
            Identificar otro género
          </button>
        </div>
      </div>
    </section>
  );
}