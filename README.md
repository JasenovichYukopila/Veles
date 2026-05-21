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
├── data/                         # Datos del proyecto
│   ├── raw/                      # Audio fuente (no versionado)
│   ├── songs/                    # Datasets de features de audio
│   │   ├── audio_features_15s.csv
│   │   └── audio_features_v1_30s.csv
│   └── spotify/                  # Datasets extraídos de Spotify API
│       ├── spotify_business_metrics.csv
│       └── spotify_b2c_recommendations.csv
│
└── reports/                      # Reportes y visualizaciones
    └── figures/
        └── figures1/             # Matrices de confusión de modelos
            ├── confusion_matrix_Gradient_Boosting.png
            ├── confusion_matrix_LinearSVC.png
            ├── confusion_matrix_Random_Forest.png
            ├── confusion_matrix_SVM_Linear.png
            ├── confusion_matrix_SVM_Poly.png
            ├── confusion_matrix_SVM_RBF.png
            └── confusion_matrix_Voting_Linear_GB_RF.png
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

Extrae datos comerciales desde la API de Spotify para alimentar dashboards de BI y B2C.

- **Autenticación:** Client Credentials vía `.env` (variables `SPOTIPY_CLIENT_ID` y `SPOTIPY_CLIENT_SECRET`)
- **Géneros consultados:** vallenato, jazz, clasica, pop, rock, electronica, hiphop
- **Datos extraídos:** Top 10 artistas por género + Top 3 pistas por artista
- **KPIs por género:** popularidad promedio/max/min, seguidores totales/promedio, duración promedio, % explícitos, diversidad de sub-géneros, % con preview
- **Datos sintéticos:** Edad promedio, % hombres/mujeres y ganancia potencial generados con ruido gaussiano
- **Salida:**
  - `data/spotify/spotify_business_metrics.csv` — 1 fila por género, 17 columnas
  - `data/spotify/spotify_b2c_recommendations.csv` — 1 fila por canción, archivo plano

### 3. Entrenamiento de Modelos (`03_model_training.ipynb`)

Entrena y evalúa 7 clasificadores para predicción de género musical.

- **Modelos:** SVM (RBF/Linear/Poly), Random Forest, Gradient Boosting, LinearSVC, Voting Classifier
- **Validación:** GroupShuffleSplit (80/20) para evitar data leakage por canción
- **Mejor modelo:** Voting Classifier (Linear SVM + GB + RF) con ~69% accuracy y Macro F1
- **Salida:** Matrices de confusión en `reports/figures/figures1/`

---

## Datasets Generados

### `data/spotify/spotify_business_metrics.csv`

Métricas agregadas por género musical (7 filas, 17 columnas).

| Columna                           | Descripción                                         |
| --------------------------------- | --------------------------------------------------- |
| `genero`                          | Nombre del género musical                           |
| `popularidad_promedio`            | Popularidad promedio de los artistas (0–100)        |
| `seguidores_totales`              | Suma de seguidores de todos los artistas del género |
| `edad_promedio_oyente`            | Edad promedio del oyente (dato sintético)           |
| `porcentaje_hombres`              | % hombres oyentes (dato sintético)                  |
| `porcentaje_mujeres`              | % mujeres oyentes (dato sintético)                  |
| `potencial_ganancia_usd`          | Ganancia potencial estimada en USD (dato sintético) |
| `duracion_promedio_ms`            | Duración promedio de las canciones en milisegundos  |
| `porcentaje_explicitos`           | % de canciones con contenido explícito              |
| `popularidad_max`                 | Popularidad máxima entre artistas del género        |
| `popularidad_min`                 | Popularidad mínima entre artistas del género        |
| `diversidad_generos_secundarios`  | Cantidad de sub-géneros distintos encontrados       |
| `total_canciones_encontradas`     | Total de canciones obtenidas para el género         |
| `porcentaje_con_preview`          | % de canciones que tienen preview disponible        |
| `promedio_seguidores_por_artista` | Promedio de seguidores por artista                  |
| `potencial_ganancia_usd_log`      | Logaritmo natural de `potencial_ganancia_usd`       |
| `seguidores_totales_log`          | Logaritmo natural de `seguidores_totales`           |

### `data/spotify/spotify_b2c_recommendations.csv`

Catálogo plano de artistas y canciones por género para consumo B2C.

| Columna               | Descripción                                     |
| --------------------- | ----------------------------------------------- |
| `genero`              | Nombre del género musical                       |
| `artista_nombre`      | Nombre del artista                              |
| `artista_id`          | ID de Spotify del artista                       |
| `popularidad_artista` | Popularidad del artista (0–100)                 |
| `seguidores_artista`  | Seguidores del artista                          |
| `imagen_artista`      | URL de la imagen del artista                    |
| `cancion_nombre`      | Nombre de la canción                            |
| `cancion_id`          | ID de Spotify de la canción                     |
| `popularidad_cancion` | Popularidad de la canción (0–100)               |
| `duracion_ms`         | Duración de la canción en milisegundos          |
| `es_explicito`        | Si la canción tiene contenido explícito         |
| `url_preview`         | URL del preview de 30s (vacío si no disponible) |
| `imagen_album`        | URL de la imagen del álbum                      |
| `generos_artista`     | Lista de sub-géneros del artista                |

---

## Requisitos

- Python 3.14+
- [uv](https://docs.astral.sh/uv/) (gestor de paquetes)
- FFmpeg (para decodificación de MP3)

```bash
uv sync
uv run jupyter notebook notebooks/
```

---

## Spotify API

1. Crear app en https://developer.spotify.com/dashboard
2. Copiar Client ID y Client Secret
3. Crear `.env` desde `.env.example`:

```
SPOTIPY_CLIENT_ID="tu_client_id"
SPOTIPY_CLIENT_SECRET="tu_client_secret"
```

El notebook carga las credenciales desde `.env` automáticamente con `python-dotenv`. **No se deben hardcodear credenciales en el notebook.**

---

## Aplicación Web — Veles

Interfaz interactiva para demostración del modelo en tiempo real. Permite grabar audio desde el micrófono y obtener la clasificación del género musical al instante.

### Requisitos adicionales

- Node.js 18+
- ffmpeg instalado y en el PATH del sistema
  - Windows: `winget install ffmpeg`
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

### Correr el backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Servidor disponible en `http://localhost:8000`.
Documentación de la API en `http://localhost:8000/docs`.

### Correr el frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicación disponible en `http://localhost:5173`.

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

### Notas

- El backend debe estar corriendo antes de usar la aplicación.
- El frontend se conecta al backend en `http://localhost:8000`.
- El entorno virtual `.venv` y `node_modules` no se versionan en Git.

---

## Licencia

Uso académico e investigativo.
