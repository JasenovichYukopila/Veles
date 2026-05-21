import csv
import os
from typing import Any

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'spotify')

BUSINESS_FILE = os.path.join(DATA_DIR, 'spotify_business_metrics.csv')
PERSONAL_FILE  = os.path.join(DATA_DIR, 'spotify_b2c_recommendations.csv')

GENRE_MAP = {
    'pop': 'Pop',
    'rock': 'Rock',
    'jazz': 'Jazz',
    'hip-hop': 'Hip-Hop',
    'classical': 'Clásica',
    'electronic': 'Electrónica',
    'reggaeton': 'Vallenato',
}

INVERSE_GENRE_MAP = {v: k for k, v in GENRE_MAP.items()}


def _read_csv(filepath: str) -> list[dict[str, Any]]:
    if not os.path.exists(filepath):
        return []
    with open(filepath, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return [dict(row) for row in reader]


def get_business_metrics() -> list[dict[str, Any]]:
    rows = _read_csv(BUSINESS_FILE)
    result = []
    for row in rows:
        mapped_genre = GENRE_MAP.get(row.get('genero', ''), row.get('genero', ''))
        entry = {
            'genero': mapped_genre,
            'popularidad_promedio': _float_or(row.get('popularidad_promedio'), 0),
            'seguidores_totales': _int_or(row.get('seguidores_totales'), 0),
            'edad_promedio_oyente': _float_or(row.get('edad_promedio_oyente'), 0),
            'porcentaje_hombres': _float_or(row.get('porcentaje_hombres'), 0),
            'porcentaje_mujeres': _float_or(row.get('porcentaje_mujeres'), 0),
            'potencial_ganancia_usd': _int_or(row.get('potencial_ganancia_usd'), 0),
        }
        result.append(entry)
    return result


def get_personal_recommendations(genre: str) -> list[dict[str, Any]]:
    raw_genre = INVERSE_GENRE_MAP.get(genre, genre.lower())
    rows = _read_csv(PERSONAL_FILE)
    filtered = [row for row in rows if row.get('genero', '').strip().lower() == raw_genre.lower()]
    result = []
    for row in filtered:
        entry = {
            'genero': GENRE_MAP.get(row.get('genero', ''), row.get('genero', '')),
            'artista_nombre': row.get('artista_nombre', ''),
            'artista_id': row.get('artista_id', ''),
            'popularidad_artista': _int_or(row.get('popularidad_artista'), 0),
            'seguidores_artista': _int_or(row.get('seguidores_artista'), 0),
            'imagen_artista': row.get('imagen_artista', ''),
            'cancion_nombre': row.get('cancion_nombre', ''),
            'cancion_id': row.get('cancion_id', ''),
            'popularidad_cancion': _int_or(row.get('popularidad_cancion'), 0),
            'url_preview': row.get('url_preview', ''),
            'imagen_album': row.get('imagen_album', ''),
        }
        result.append(entry)
    return result


def _float_or(val: str | None, default: float) -> float:
    if val is None:
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def _int_or(val: str | None, default: int) -> int:
    if val is None:
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default
