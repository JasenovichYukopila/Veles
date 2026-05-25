export type Genre =
    | 'Clásica'
    | 'Electrónica'
    | 'Hip-Hop'
    | 'Jazz'
    | 'Pop'
    | 'Rock'
    | 'Vallenato';

export type Stage =
    | 'landing'
    | 'menu'
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
    artistas_encontrados: number;
    canciones_encontradas: number;
    duracion_promedio_min: number | null;
    porcentaje_explicitos: number | null;
    edad_promedio_oyente: number;
    porcentaje_hombres: number;
    porcentaje_mujeres: number;
    potencial_ganancia_usd: number;
    meta_ingresos_usd: number;
    cumplimiento_meta_pct: number;
    tendencia_crecimiento_pct: number;
}

export interface PersonalRecommendation {
    genero: string;
    artista_nombre: string;
    artista_id: string;
    imagen_artista: string;
    cancion_nombre: string;
    cancion_id: string;
    duracion_ms: number;
    es_explicito: boolean;
    imagen_album: string;
}
