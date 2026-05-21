from pydantic import BaseModel, Field
from typing import Literal

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
    popularidad_promedio: float = 0
    seguidores_totales: int = 0
    edad_promedio_oyente: float = 0
    porcentaje_hombres: float = 0
    porcentaje_mujeres: float = 0
    potencial_ganancia_usd: int = 0

class PersonalRecommendationItem(BaseModel):
    genero: str = ''
    artista_nombre: str = ''
    artista_id: str = ''
    popularidad_artista: int = 0
    seguidores_artista: int = 0
    imagen_artista: str = ''
    cancion_nombre: str = ''
    cancion_id: str = ''
    popularidad_cancion: int = 0
    url_preview: str = ''
    imagen_album: str = ''

class BusinessMetricsResponse(BaseModel):
    data: list[BusinessMetricItem]

class PersonalRecommendationsResponse(BaseModel):
    data: list[PersonalRecommendationItem]