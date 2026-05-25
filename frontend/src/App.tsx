import { useState, useEffect } from 'react';
import type { Stage, ClassificationResult } from './types';
import { GENRE_INFO } from './constants';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { ProgressBar }      from './components/ProgressBar/ProgressBar';
import StageLanding      from './components/stages/StageLanding/StageLanding';
import { StageMenu }        from './components/stages/StageMenu/StageMenu';
import { StageIdle }        from './components/stages/StageIdle/StageIdle';
import { StageRecording }   from './components/stages/StageRecording/StageRecording';
import { StageProcessing }  from './components/stages/StageProcessing/StageProcessing';
import { StageResult }      from './components/stages/StageResult/StageResult';
import { StageDetail }      from './components/stages/StageDetail/StageDetail';
import { StageDashboard }   from './components/stages/StageDashboard/StageDashboard';
import './App.css';

export default function App() {
  const [stage, setStage]         = useState<Stage>('landing');
  const [result, setResult]       = useState<ClassificationResult | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [classifyError, setClassifyError] = useState(false);

  const handleResult = (data: ClassificationResult) => {
    setResult(data);
  };

  const handleError = () => {
    setClassifyError(true);
  };

  const { startRecording, stream } = useAudioRecorder({
    setStage,
    onResult: handleResult,
    onAudioBlob: setAudioBlob,
    onError: handleError,
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
    setAudioBlob(null);
    setClassifyError(false);
    setStage('menu');
  };

  const showProgressBar = stage !== 'landing' && stage !== 'menu' && stage !== 'dashboard';

  const renderStage = () => {
    switch (stage) {
      case 'landing':
        return <StageLanding onContinue={() => setStage('menu')} />;
      case 'menu':
        return (
          <StageMenu
            onClassify={() => setStage('idle')}
            onDashboard={() => setStage('dashboard')}
            onBack={() => setStage('landing')}
          />
        );
      case 'idle':
        return <StageIdle onStart={handleStart} onBack={() => setStage('menu')} />;
      case 'recording':
        return <StageRecording stream={stream} />;
      case 'processing':
        return (
          <StageProcessing
            audioBlob={audioBlob}
            analysisReady={result !== null}
            error={classifyError}
            onContinue={() => setStage('result')}
            onRetry={() => { setClassifyError(false); setAudioBlob(null); setStage('idle'); }}
          />
        );
      case 'result':
        return result ? (
          <StageResult
            result={result}
            onContinue={() => setStage('detail')}
            onReset={handleReset}
          />
        ) : null;
      case 'detail':
        return result ? (
          <StageDetail
            result={result}
            onReset={handleReset}
          />
        ) : null;
      case 'dashboard':
        return (
          <StageDashboard
            genre={result?.genre}
            onReset={handleReset}
          />
        );
    }
  };

  return (
    <main className={`app app--${stage}`}>
      <div className="app__noise" aria-hidden="true" />
      <div className="app__ambient" aria-hidden="true" />
      {showProgressBar && <ProgressBar currentStage={stage} />}
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