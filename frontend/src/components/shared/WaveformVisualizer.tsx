import { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  stream:   MediaStream | null;
  isActive: boolean;
}

export function WaveformVisualizer({ stream, isActive }: WaveformVisualizerProps) {
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    if (!isActive || !stream) {
      cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioContext = new AudioContext();
    const analyser     = audioContext.createAnalyser();
    const source       = audioContext.createMediaStreamSource(stream);

    analyser.fftSize               = 64;
    analyser.smoothingTimeConstant = 0.85;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray    = new Uint8Array(bufferLength);

    const draw = () => {
        animationFrameId.current = requestAnimationFrame(draw);

        const { width, height } = canvas;
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, width, height);

        const gap      = 4;
        const barWidth = (width - gap * (bufferLength - 1)) / bufferLength;
        const color    = getComputedStyle(document.documentElement)
            .getPropertyValue('--genre-color').trim() || '#7C3AED';

        for (let i = 0; i < bufferLength; i++) {
            const normalized = Math.pow(dataArray[i] / 255, 0.5);
            const minHeight  = height * 0.08;
            const barHeight  = minHeight + normalized * (height * 0.85 - minHeight);
            const alpha      = 0.2 + normalized * 0.8;
            
            ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, '0');
            
            const x = i * (barWidth + gap);
            const y = (height - barHeight) / 2;
            
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 2);
            ctx.fill();
        }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      audioContext.close();
    };
  }, [isActive, stream]);

  return (
    <canvas
      ref={canvasRef}
      width={340}
      height={64}
      style={{
        opacity:    isActive ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
}