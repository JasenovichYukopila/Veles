import type { Stage } from '../../types';
import './ProgressBar.css';

interface ProgressBarProps {
  currentStage: Stage;
}

const STAGES: Stage[] = ['idle', 'recording', 'processing', 'result', 'detail'];

const STAGE_LABELS: Record<Stage, string> = {
  idle:       'Inicio',
  recording:  'Grabando',
  processing: 'Analizando',
  result:     'Resultado',
  detail:     'Detalle',
};

export function ProgressBar({ currentStage }: ProgressBarProps) {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <nav className="progress-bar" aria-label="Progreso">
      {STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent   = index === currentIndex;

        return (
          <div key={stage} className="progress-bar__item">
            <div
              className={[
                'progress-bar__track',
                isCompleted ? 'progress-bar__track--completed' : '',
                isCurrent   ? 'progress-bar__track--current'   : '',
              ].join(' ')}
            >
              <div className="progress-bar__fill" />
            </div>
            <span className={`progress-bar__label ${isCurrent ? 'progress-bar__label--active' : ''}`}>
              {STAGE_LABELS[stage]}
            </span>
          </div>
        );
      })}
    </nav>
  );
}