import { API_BASE_URL } from '../constants';
import type { ClassificationResult } from '../types';

const MOCK_ENABLED = false;

const MOCK_RESULT: ClassificationResult = {
  genre: 'Jazz',
  confidence: 0.87,
};

export async function classifyAudio(audioBlob: Blob): Promise<ClassificationResult> {
  if (MOCK_ENABLED) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_RESULT;
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const response = await fetch(`${API_BASE_URL}/classify`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Classification failed with status ${response.status}`);
  }

  return response.json() as Promise<ClassificationResult>;
}