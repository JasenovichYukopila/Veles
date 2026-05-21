export type Genre =
    | 'Clásica'
    | 'Electrónica'
    | 'Hip-Hop'
    | 'Jazz'
    | 'Pop'
    | 'Rock'
    | 'Vallenato';
    
export type Stage =
    | 'idle'
    | 'recording'
    | 'processing'
    | 'result'
    | 'detail';

export interface ClassificationResult {
    genre: Genre;
    confidence: number;
}

export interface ClassificationError {
    message: string;
}