import { useState, useEffect } from 'react';
import type { Stage, ClassificationResult } from './types';
import { GENRE_INFO } from './constants';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { ProgressBar }      from './components/ProgressBar/ProgressBar';
import { StageIdle }        from './components/stages/StageIdle/StageIdle';
import { StageRecording }   from './components/stages/StageRecording/StageRecording';
import { StageProcessing }  from './components/stages/StageProcessing/StageProcessing';
import { StageResult }      from './components/stages/StageResult/StageResult';
import { StageDetail }      from './components/stages/StageDetail/StageDetail';
import { StageDashboard }   from './components/stages/StageDashboard/StageDashboard';
import './App.css';

export default function App() {
  const [stage, setStage]         = useState<Stage>('idle');
  const [result, setResult]       = useState<ClassificationResult | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleResult = (data: ClassificationResult) => {
    setResult(data);
    // Stage stays on 'processing' — user must confirm to continue
  };

  const { startRecording, stream } = useAudioRecorder({
    setStage,
    onResult: handleResult,
    onAudioBlob: setAudioBlob,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (result) {
      const info = GENRE_INFO[result.genre];
      root.style.setProperty('--genre-color', info.color);
      root.style.setProperty('--genre-color-rgb', hexToRgb(info.color));
    } else {
      root.style.setProperty('--genre-color', '#7C3AED');
      root.style.setProperty('--genre-color-rgb', '124, 58, 237');
    }
  }, [result]);

  const handleStart = () => {
    startRecording();
  };

  const handleReset = () => {
    setResult(null);
    setStage('idle');
  };

  const renderStage = () => {
    switch (stage) {
      case 'idle':
        return <StageIdle onStart={handleStart} />;
      case 'recording':
        return <StageRecording stream={stream} />;
      case 'processing':
        return (
          <StageProcessing
            audioBlob={audioBlob}
            analysisReady={result !== null}
            onContinue={() => setStage('result')}
          />
        );
      case 'result':
        return result ? (
          <StageResult
            result={result}
            onContinue={() => setStage('detail')}
            onReset={handleReset}
            onDashboard={() => setStage('dashboard')}
          />
        ) : null;
      case 'detail':
        return result ? (
          <StageDetail
            result={result}
            onReset={handleReset}
            onDashboard={() => setStage('dashboard')}
          />
        ) : null;
      case 'dashboard':
        return result ? (
          <StageDashboard
            genre={result.genre}
            onReset={handleReset}
          />
        ) : null;
    }
  };

  return (
    <main className={`app app--${stage}`}>
      <div className="app__noise" aria-hidden="true" />
      <div className="app__ambient" aria-hidden="true" />
      <ProgressBar currentStage={stage} />
      <div className="app__content">
        {renderStage()}
      </div>
    </main>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}