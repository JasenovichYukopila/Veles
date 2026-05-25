import csv
import os
from typing import Any

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'spotify')

BUSINESS_FILE = os.path.join(DATA_DIR, 'spotify_business_metrics.csv')
PERSONAL_FILE  = os.path.join(DATA_DIR, 'spotify_b2c_recommendations.csv')

# Mapa de nombre interno (CSV) → nombre de display (frontend)
GENRE_MAP = {
    'vallenato':   'Vallenato',
    'jazz':        'Jazz',
    'clasica':     'Clásica',
    'pop':         'Pop',
    'rock':        'Rock',
    'electronica': 'Electrónica',
    'hiphop':      'Hip-Hop',
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
        raw_genre = row.get('genero', '')
        display_genre = GENRE_MAP.get(raw_genre, raw_genre)

        artistas = _int_or(row.get('artistas_encontrados'), 0)
        canciones = _int_or(row.get('canciones_encontradas'), 0)

        entry: dict[str, Any] = {
            'genero': display_genre,
            'artistas_encontrados': artistas,
            'canciones_encontradas': canciones,
        }

        # Solo incluir métricas de catálogo si hay datos reales
        if canciones > 0:
            entry['duracion_promedio_min'] = _float_or(row.get('duracion_promedio_min'), None)
            entry['porcentaje_explicitos'] = _float_or(row.get('porcentaje_explicitos'), None)
        else:
            entry['duracion_promedio_min'] = None
            entry['porcentaje_explicitos'] = None

        # Datos sintéticos — siempre presentes
        entry['edad_promedio_oyente'] = _float_or(row.get('edad_promedio_oyente'), 0)
        entry['porcentaje_hombres'] = _float_or(row.get('porcentaje_hombres'), 0)
        entry['porcentaje_mujeres'] = _float_or(row.get('porcentaje_mujeres'), 0)
        entry['potencial_ganancia_usd'] = _int_or(row.get('potencial_ganancia_usd'), 0)
        entry['meta_ingresos_usd'] = _int_or(row.get('meta_ingresos_usd'), 0)
        entry['cumplimiento_meta_pct'] = _float_or(row.get('cumplimiento_meta_pct'), 0)
        entry['tendencia_crecimiento_pct'] = _float_or(row.get('tendencia_crecimiento_pct'), 0)

        # KPIs de Inversión calculados con lógica de negocio
        riesgo_map = {
            'Pop': 'Bajo',
            'Vallenato': 'Bajo',
            'Rock': 'Medio',
            'Electrónica': 'Medio',
            'Clásica': 'Medio',
            'Hip-Hop': 'Alto',
            'Jazz': 'Alto',
        }
        score_map = {
            'Pop': 94,
            'Hip-Hop': 89,
            'Vallenato': 85,
            'Electrónica': 82,
            'Rock': 78,
            'Clásica': 68,
            'Jazz': 58,
        }
        riesgo = riesgo_map.get(display_genre, 'Medio')
        score = score_map.get(display_genre, 75)
        factor = 0.25 if riesgo == 'Bajo' else (0.15 if riesgo == 'Medio' else 0.08)
        
        entry['riesgo_inversion'] = riesgo
        entry['score_inversion'] = score
        entry['inversion_recomendada_usd'] = int(entry['potencial_ganancia_usd'] * factor)
        entry['roi_estimado_pct'] = round(score * 0.4 + entry['tendencia_crecimiento_pct'] * 0.5, 1)

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
            'imagen_artista': row.get('imagen_artista', ''),
            'cancion_nombre': row.get('cancion_nombre', ''),
            'cancion_id': row.get('cancion_id', ''),
            'duracion_ms': _int_or(row.get('duracion_ms'), 0),
            'es_explicito': row.get('es_explicito', 'False').strip().lower() == 'true',
            'imagen_album': row.get('imagen_album', ''),
        }
        result.append(entry)
    return result


def _float_or(val: str | None, default: float | None) -> float | None:
    if val is None or val == '':
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def _int_or(val: str | None, default: int) -> int:
    if val is None or val == '':
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default
