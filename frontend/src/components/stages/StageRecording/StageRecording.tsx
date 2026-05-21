import { WaveformVisualizer } from '../../shared/WaveformVisualizer';
import './StageRecording.css';

interface StageRecordingProps {
  stream: MediaStream | null;
}

export function StageRecording({ stream }: StageRecordingProps) {
  return (
    <section className="stage-recording">
      <div className="stage-recording__content">
        <div className="stage-recording__visualizer">
          <WaveformVisualizer stream={stream} isActive={true} />
        </div>

        <div className="stage-recording__indicator">
          <span className="stage-recording__dot" />
          <span className="stage-recording__label">Escuchando</span>
        </div>

        <p className="stage-recording__hint">
          Pon música cerca del micrófono
        </p>
      </div>
    </section>
  );
}