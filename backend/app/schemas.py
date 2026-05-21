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