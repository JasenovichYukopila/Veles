import { useRef, useCallback, useState, useEffect } from 'react';
import type { Stage, ClassificationResult } from '../types';
import { classifyAudio } from '../services/classifier';
import { RECORDING_DURATION_MS } from '../constants';

interface UseAudioRecorderProps {
  setStage: (stage: Stage) => void;
  onResult: (result: ClassificationResult) => void;
  onAudioBlob?: (blob: Blob) => void;
}

interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>;
  stream:         MediaStream | null;
}

export function useAudioRecorder({
  setStage,
  onResult,
  onAudioBlob,
}: UseAudioRecorderProps): UseAudioRecorderReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const isMountedRef     = useRef(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    chunksRef.current = [];

    try {
      setStage('recording');

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!isMountedRef.current) {
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }

      setStream(mediaStream);

      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        mediaStream.getTracks().forEach(track => track.stop());
        setStream(null);

        if (!isMountedRef.current) return;

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        onAudioBlob?.(audioBlob);

        try {
          setStage('processing');
          const result = await classifyAudio(audioBlob);
          if (isMountedRef.current) {
            onResult(result);
          }
        } catch {
          if (isMountedRef.current) {
            setStage('idle');
          }
        }
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, RECORDING_DURATION_MS);

    } catch {
      if (isMountedRef.current) {
        setStage('idle');
      }
    }
  }, [setStage, onResult]);

  return { startRecording, stream };
}