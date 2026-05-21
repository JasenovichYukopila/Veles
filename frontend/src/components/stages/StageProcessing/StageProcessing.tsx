import './StageProcessing.css';

export function StageProcessing() {
  return (
    <section className="stage-processing">
      <div className="stage-processing__content">
        <div className="stage-processing__visual">
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
        </div>

        <div className="stage-processing__text">
          <p className="stage-processing__label">Analizando audio</p>
          <p className="stage-processing__hint">
            Identificando patrones espectrales
          </p>
        </div>
      </div>
    </section>
  );
}