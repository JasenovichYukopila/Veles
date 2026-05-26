# Veles

Motor de clasificación de géneros musicales basado en **ingeniería de características acústicas** (librosa) y **datos comerciales de Spotify** (spotipy). Combina un pipeline de audio DSP con aprendizaje automático para predecir géneros musicales, analizar su rendimiento comercial y visualizar KPIs de mercado mediante un dashboard interactivo.

---

## Estructura del Proyecto

```
Veles/
├── .env                          # Credenciales de Spotify (no versionado)
├── .env.example                  # Template para credenciales de Spotify
├── .python-version               # Python 3.14
├── pyproject.toml                # Dependencias del proyecto (notebooks + ML)
├── uv.lock                       # Lock file generado por uv
├── README.md
│
├── notebooks/
│   ├── Music Classifier/
│   │   ├── 01_audio_feature_extraction.ipynb   # ETL de audio (librosa)
│   │   └── 03_model_training.ipynb             # Entrenamiento y evaluación
│   └── Other/
│       └── 02_spotify_etl.ipynb                # ETL de API de Spotify
│
├── data/
│   ├── raw/                      # Audio fuente (no versionado)
│   ├── songs/                    # Datasets de features de audio
│   │   ├── audio_features_15s.csv
│   │   └── audio_features_v1_30s.csv
│   └── spotify/                  # Datasets extraídos de Spotify API
│       ├── spotify_business_metrics.csv
│       └── spotify_b2c_recommendations.csv
│
├── backend/                      # API FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── classifier.py
│   │   ├── dashboard.py
│   │   └── schemas.py
│   └── requirements.txt
│
├── frontend/                     # App React + Vite
│   └── src/
│       ├── App.tsx              # Router de stages (8 vistas)
│       ├── types/index.ts       # Tipos compartidos
│       ├── constants/index.ts   # CONFIG + GENRE_INFO
│       ├── services/
│       │   ├── classifier.ts    # POST /classify
│       │   └── dashboard.ts     # GET /dashboard/*
│       ├── hooks/
│       │   └── useAudioRecorder.ts
│       └── components/
│           ├── ProgressBar/
│           ├── shared/
│           │   └── WaveformVisualizer.tsx
│           └── stages/
│               ├── StageLanding/     # Pantalla de bienvenida
│               ├── StageMenu/        # Menú: Clasificación vs Dashboard
│               ├── StageIdle/        # Listo para grabar
│               ├── StageRecording/   # Grabación con waveform
│               ├── StageProcessing/  # Análisis en progreso
│               ├── StageResult/      # Resultado de clasificación
│               ├── StageDetail/      # Recomendaciones Spotify
│               └── StageDashboard/   # Dashboard empresarial
│
└── reports/                      # Reportes y visualizaciones
    └── figures/
```

---

## Flujo de Trabajo

### 1. Extracción de Características de Audio (`01_audio_feature_extraction.ipynb`)

Convierte archivos de audio (`.mp3`/`.wav`) organizados por género en datasets estructurados.

- **Entrada:** Audio en `data/raw/{genero}/` (requiere FFmpeg)
- **Procesamiento:** Ventanas deslizantes de 15s con 1s de solapamiento
- **Características extraídas (40+):** tempo, MFCCs, spectral centroid, chroma, zero-crossing rate, rolloff, etc.
- **Salida:** `data/songs/audio_features_*s.csv`

### 2. ETL Spotify (`02_spotify_etl.ipynb`)

Extrae datos comerciales desde la API de Spotify para alimentar dashboards de BI empresarial y B2C.

- **Autenticación:** Client Credentials vía `.env` (variables `SPOTIPY_CLIENT_ID` y `SPOTIPY_CLIENT_SECRET`)
- **Géneros consultados:** vallenato, jazz, clasica, pop, rock, electronica, hiphop
- **Datos extraídos:** Top 10 artistas por género + Top 3 pistas por artista
- **KPIs de catálogo:** artistas únicos, duración promedio, % explícitos, diversidad de sub-géneros, % con preview
- **KPIs de inversión:** score_inversion, riesgo_inversion, inversion_recomendada_usd, roi_estimado_pct
- **KPIs de metas:** meta_ingresos_usd, cumplimiento_meta_pct, tendencia_crecimiento_pct
- **Datos sintéticos:** Edad promedio, % hombres/mujeres y ganancia potencial generados con ruido gaussiano
- **Salida:**
  - `data/spotify/spotify_business_metrics.csv` — 1 fila por género, 22 columnas
  - `data/spotify/spotify_b2c_recommendations.csv` — 1 fila por canción, archivo plano

### 3. Entrenamiento de Modelos (`03_model_training.ipynb`)

Entrena y evalúa 7 clasificadores para predicción de género musical.

- **Modelos:** SVM (RBF/Linear/Poly), Random Forest, Gradient Boosting, LinearSVC, Voting Classifier
- **Validación:** GroupShuffleSplit (80/20) para evitar data leakage por canción
- **Mejor modelo:** Voting Classifier (Linear SVM + GB + RF) con ~86.5% accuracy
- **Salida:** Matrices de confusión en `reports/figures/`

---

## Datasets Generados

### `data/spotify/spotify_business_metrics.csv`

Métricas agregadas por género musical (7 filas, 22 columnas).

#### Catálogo y alcance

| Columna | Descripción |
|---|---|
| `genero` | Nombre del género musical |
| `artistas_unicos` | Cantidad de artistas distintos encontrados |
| `total_canciones_encontradas` | Total de canciones obtenidas para el género |
| `duracion_promedio_ms` | Duración promedio de las canciones en milisegundos |
| `porcentaje_explicitos` | % de canciones con contenido explícito |
| `porcentaje_con_preview` | % de canciones que tienen preview disponible |
| `popularidad_max` | Popularidad máxima entre artistas del género |
| `popularidad_min` | Popularidad mínima entre artistas del género |
| `diversidad_generos_secundarios` | Promedio de sub-géneros por artista |

#### Inversión y mercado

| Columna | Descripción |
|---|---|
| `indice_comerciabilidad` | Índice 0–100: popularidad techo + preview + bajo contenido explícito |
| `score_inversion` | Índice 0–100: atractivo compuesto para invertir en el género |
| `riesgo_inversion` | Nivel de riesgo: `Bajo` / `Medio` / `Alto` |
| `nivel_madurez_mercado` | Etapa del mercado: `Nicho` / `Emergente` / `Crecimiento` / `Maduro` |
| `inversion_recomendada_usd` | Capital sugerido a invertir en USD (fracción del potencial según riesgo) |
| `roi_estimado_pct` | Retorno estimado sobre la inversión recomendada (%) |

#### Demografía (sintético)

| Columna | Descripción |
|---|---|
| `edad_promedio_oyente` | Edad promedio del oyente |
| `porcentaje_hombres` | % hombres oyentes |
| `porcentaje_mujeres` | % mujeres oyentes |
| `potencial_ganancia_usd` | Ganancia potencial estimada en USD |

#### Metas

| Columna | Descripción |
|---|---|
| `meta_ingresos_usd` | Objetivo de ingresos (120% del potencial base) |
| `cumplimiento_meta_pct` | Avance hacia la meta expresado en % |
| `tendencia_crecimiento_pct` | Proyección de crecimiento anual estimada (%) |

### `data/spotify/spotify_b2c_recommendations.csv`

Catálogo plano de artistas y canciones por género para consumo B2C.

| Columna | Descripción |
|---|---|
| `genero` | Nombre del género musical |
| `artista_nombre` | Nombre del artista |
| `artista_id` | ID de Spotify del artista |
| `popularidad_artista` | Popularidad del artista (0–100) |
| `seguidores_artista` | Seguidores del artista |
| `imagen_artista` | URL de la imagen del artista |
| `cancion_nombre` | Nombre de la canción |
| `cancion_id` | ID de Spotify de la canción |
| `popularidad_cancion` | Popularidad de la canción (0–100) |
| `duracion_ms` | Duración de la canción en milisegundos |
| `es_explicito` | Si la canción tiene contenido explícito |
| `url_preview` | URL del preview de 30s (vacío si no disponible) |
| `imagen_album` | URL de la imagen del álbum |
| `generos_artista` | Lista de sub-géneros del artista |

---

## Requisitos

- Python 3.14+
- [uv](https://docs.astral.sh/uv/) — gestor de paquetes y entornos
- Node.js 18+ (solo para el frontend)
- FFmpeg (para decodificación de MP3)
  - Windows: `winget install ffmpeg`
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

---

## Correr los Notebooks

```bash
# Instalar dependencias y lanzar Jupyter
uv sync
uv run jupyter notebook notebooks/
```

---

## Spotify API

Crear el archivo `.env` en la raíz del proyecto (ya incluido en `.gitignore`):

```bash
cp .env.example .env
# Editar .env con tus credenciales de https://developer.spotify.com/dashboard
```

```
SPOTIPY_CLIENT_ID="tu_client_id"
SPOTIPY_CLIENT_SECRET="tu_client_secret"
```

El notebook carga las credenciales automáticamente con `python-dotenv`. **No se deben hardcodear credenciales en el notebook.**

---

## Aplicación Web — Veles

Interfaz interactiva con **dos modos de uso**: clasificación de audio en tiempo real y dashboard empresarial de métricas de mercado.

### Modo 1: Clasificación Acústica

Graba 15 segundos de audio desde el micrófono y el modelo predice el género musical, mostrando además recomendaciones de canciones en Spotify.

Flujo: `Idle → Recording → Processing → Result → Detail`

### Modo 2: Dashboard Empresarial

Panel de KPIs de mercado y comportamiento comercial por género musical. Incluye:

- **Sidebar de género** con 15 métricas detalladas (potencial, meta, cumplimiento, tendencia, ROI, inversión recomendada, score, riesgo, edad, H/M, artistas, canciones, duración, explícito)
- **Gráficos interactivos** (barras de potencial, doughnuts de demografía, tarjetas de metas)
- **Zoom con análisis** para cada gráfico: análisis estadístico al hacer clic
- **Filtro por género** que filtra todos los datos y overlays
- **Insights estratégicos** personalizados por género

### Endpoints del backend

| Endpoint | Descripción |
|----------|-------------|
| `POST /classify` | Clasifica audio: entrada `audio/*`, salida `{ genre, confidence }` |
| `GET /dashboard/business` | KPIs empresariales por género (7 géneros, 20+ columnas) |
| `GET /dashboard/personal?genre=X` | Recomendaciones B2C filtradas por género |

### Correr el backend

```bash
cd backend

# Crear entorno virtual e instalar dependencias
uv venv
uv pip install -r requirements.txt

# Iniciar el servidor
uv run uvicorn app.main:app --reload
```

> El servidor queda disponible en `http://localhost:8000`.  
> Documentación interactiva de la API en `http://localhost:8000/docs`.

### Correr el frontend

```bash
cd frontend
npm install
npm run dev
```

> La aplicación queda disponible en `http://localhost:5173`.

### Notas

- El backend debe estar corriendo **antes** de usar la aplicación frontend.
- El frontend se conecta al backend en `http://localhost:8000`.
- El entorno virtual `.venv` y `node_modules` no se versionan en Git.

### Conectar el modelo entrenado

Cuando el modelo esté exportado, abrir `backend/app/classifier.py` y reemplazar estas dos líneas en la función `classify`:

```python
genre      = random.choice(GENRES)
confidence = round(random.uniform(0.60, 0.95), 2)
```

Por la predicción real del modelo:

```python
features   = extract_features(audio, sr).reshape(1, -1)
prediction = model.predict(features)[0]
confidence = model.predict_proba(features).max()
genre      = prediction
```

---

## Licencia

Uso académico e investigativo.
