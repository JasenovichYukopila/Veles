import './StageIdle.css';

interface StageIdleProps {
  onStart: () => void;
}

export function StageIdle({ onStart }: StageIdleProps) {
  return (
    <section className="stage-idle">
      <div className="stage-idle__content">
        <div className="stage-idle__header">
          <h1 className="stage-idle__title">SoundID</h1>
          <p className="stage-idle__subtitle">
            Identificación de géneros musicales
          </p>
        </div>

        <button
          className="stage-idle__btn"
          onClick={onStart}
          aria-label="Iniciar identificación"
        >
          <div className="stage-idle__btn-ring stage-idle__btn-ring--outer" />
          <div className="stage-idle__btn-ring stage-idle__btn-ring--inner" />
          <div className="stage-idle__btn-core">
            <MicIcon />
          </div>
        </button>

        <p className="stage-idle__hint">
          Toca para identificar un género
        </p>
      </div>
    </section>
  );
}

function MicIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}