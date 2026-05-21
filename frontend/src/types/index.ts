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
    | 'detail'
    | 'dashboard';

export interface ClassificationResult {
    genre: Genre;
    confidence: number;
}

export interface ClassificationError {
    message: string;
}

export interface BusinessMetric {
    genero: string;
    popularidad_promedio: number;
    seguidores_totales: number;
    edad_promedio_oyente: number;
    porcentaje_hombres: number;
    porcentaje_mujeres: number;
    potencial_ganancia_usd: number;
}

export interface PersonalRecommendation {
    genero: string;
    artista_nombre: string;
    artista_id: string;
    popularidad_artista: number;
    seguidores_artista: number;
    imagen_artista: string;
    cancion_nombre: string;
    cancion_id: string;
    popularidad_cancion: number;
    url_preview: string;
    imagen_album: string;
}
