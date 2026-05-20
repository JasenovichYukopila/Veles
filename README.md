# Veles

Motor de clasificación de géneros musicales basado en **ingeniería de características acústicas** (librosa) y **datos comerciales de Spotify** (spotipy). Combina un pipeline de audio DSP con aprendizaje automático para predecir géneros musicales y analizar su rendimiento comercial.

---

## Estructura del Proyecto

```
Veles/
├── .env.example                  # Template para credenciales de Spotify
├── .gitignore
├── .python-version               # Python 3.14
├── pyproject.toml                # Dependencias del proyecto
├── uv.lock                       # Lock file generado por uv
├── README.md
│
├── notebooks/                    # Notebooks ejecutables en orden
│   ├── 01_audio_feature_extraction.ipynb   # ETL de audio (librosa)
│   ├── 02_spotify_etl.ipynb                # ETL de API de Spotify
│   └── 03_model_training.ipynb             # Entrenamiento y evaluación
│
├── src/                          # Código fuente reutilizable
│   ├── __init__.py
│   └── features/
│       └── __init__.py
│
├── data/                         # Datos del proyecto
│   ├── raw/                      # Audio fuente (no versionado)
│   ├── processed/                # Datasets generados
│   │   ├── audio_features_15s.csv            # 4785 segmentos (15s, sliding window)
│   │   ├── audio_features_v1_30s.csv         # 980 segmentos (30s, inicio/medio/fin)
│   │   ├── spotify_business_metrics.csv      # Métricas agregadas por género
│   │   └── spotify_b2c_recommendations.csv   # Top artistas y canciones por género
│   ├── models/                   # Artefactos de evaluación
│   │   └── model_ranking.csv                 # Ranking de 7 modelos ML
│   └── external/                 # Caches de API (no versionado)
│
├── reports/                      # Reportes y visualizaciones
│   └── figures/                  # Matrices de confusión de modelos
│
├── config/                       # Archivos de configuración
│   └── genres.yaml               # Lista de géneros musicales
│
├── api/                          # Futuro: backend (FastAPI)
│   └── .gitkeep
│
└── frontend/                     # Futuro: frontend (Streamlit / React)
    └── .gitkeep
```

---

## Flujo de Trabajo

### 1. Extracción de Características de Audio (`notebooks/01_audio_feature_extraction.ipynb`)

Convierte archivos de audio (`.mp3`/`.wav`) organizados por género en datasets estructurados.

- **Entrada:** Audio en `data/raw/{genero}/` (requiere FFmpeg)
- **Procesamiento:** Ventanas deslizantes de 15s con 1s de solapamiento
- **Características extraídas (40+):** tempo, MFCCs, spectral centroid, chroma, zero-crossing rate, rolloff, etc.
- **Salida:** `data/processed/audio_features_15s.csv` (~4785 segmentos balanceados)

### 2. ETL Spotify (`notebooks/02_spotify_etl.ipynb`)

Extrae datos comerciales desde la API de Spotify para alimentar dashboards de BI y B2C.

- **Autenticación:** Client Credentials (configurar en celdas del notebook)
- **Géneros consultados:** pop, rock, jazz, hip-hop, classical, electronic, reggaeton
- **Datos extraídos:** Top 10 artistas por género + Top 3 pistas por artista
- **Datos sintéticos:** Edad, género y potencial de ganancia generados con ruido gaussiano
- **Salida:** `data/processed/spotify_business_metrics.csv` y `spotify_b2c_recommendations.csv`

### 3. Entrenamiento de Modelos (`notebooks/03_model_training.ipynb`)

Entrena y evalúa 7 clasificadores para predicción de género musical.

- **Modelos:** SVM (RBF/Linear/Poly), Random Forest, Gradient Boosting, LinearSVC, Voting Classifier
- **Validación:** GroupShuffleSplit (80/20) para evitar data leakage por canción
- **Mejor modelo:** Voting Classifier (Linear SVM + GB + RF) con ~69% accuracy y Macro F1
- **Salida:** Matrices de confusión en `reports/figures/`

---

## Requisitos

- Python 3.14+
- [uv](https://docs.astral.sh/uv/) (gestor de paquetes)
- FFmpeg (para decodificación de MP3)

Instalación:

```bash
uv sync
```

Para ejecutar los notebooks:

```bash
uv run jupyter notebook notebooks/
```

---

## Spotify API

Para usar el notebook `02_spotify_etl.ipynb` necesitás credenciales de Spotify:

1. Crear app en https://developer.spotify.com/dashboard
2. Copiar Client ID y Client Secret
3. Pegarlos en las constantes `CLIENT_ID` y `CLIENT_SECRET` del notebook

> ⚠️ Las credenciales quedan escritas en el notebook. Para compartir el proyecto, usar un archivo `.env` y cargarlo con `python-dotenv`.

---

## Licencia

Uso académico e investigativo.
