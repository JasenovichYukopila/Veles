from pydantic import BaseModel, Field
from typing import Literal, Optional

Genre = Literal[
    'Clásica',
    'Electrónica',
    'Hip-Hop',
    'Jazz',
    'Pop',
    'Rock',
    'Vallenato',
]

class ClassificationResponse(BaseModel):
    genre: Genre
    confidence: float = Field(ge=0.0, le=1.0)

class ErrorResponse(BaseModel):
    detail: str

class BusinessMetricItem(BaseModel):
    genero: str
    artistas_encontrados: int = 0
    canciones_encontradas: int = 0
    duracion_promedio_min: Optional[float] = None
    porcentaje_explicitos: Optional[float] = None
    edad_promedio_oyente: float = 0
    porcentaje_hombres: float = 0
    porcentaje_mujeres: float = 0
    potencial_ganancia_usd: int = 0
    meta_ingresos_usd: int = 0
    cumplimiento_meta_pct: float = 0
    tendencia_crecimiento_pct: float = 0
    score_inversion: int = 0
    riesgo_inversion: str = "Medio"
    inversion_recomendada_usd: int = 0
    roi_estimado_pct: float = 0.0

class PersonalRecommendationItem(BaseModel):
    genero: str = ''
    artista_nombre: str = ''
    artista_id: str = ''
    imagen_artista: str = ''
    cancion_nombre: str = ''
    cancion_id: str = ''
    duracion_ms: int = 0
    es_explicito: bool = False
    imagen_album: str = ''

class BusinessMetricsResponse(BaseModel):
    data: list[BusinessMetricItem]

class PersonalRecommendationsResponse(BaseModel):
    data: list[PersonalRecommendationItem]
