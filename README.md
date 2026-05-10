# Veles

## Proyecto de clasificación musical

Hasta ahora este proyecto abarca únicamente la fase de ETL. El objetivo final es una solución de identificación de géneros musicales similar a un Shazam, pero por el momento solo se ha completado la etapa de extracción y transformación de datos.

## Fase actual: ETL realizado

El proceso de ETL se implementa en el notebook `Data/ETL.ipynb` y consta de las siguientes etapas:

### 1. Importación de librerías
- `import librosa`: Librería especializada en análisis de audio y música para cargar archivos de sonido y extraer características acústicas.
- `import numpy as np`: Proporciona estructuras de datos tipo array y operaciones matemáticas vectorizadas.
- `import pandas as pd`: Para manipulación y análisis de datos tabulares, usado para crear el DataFrame final.
- `import os`: Para interactuar con el sistema de archivos, recorrer carpetas y listar archivos.
- `import warnings`: Para suprimir advertencias innecesarias.
- `from tqdm import tqdm`: Para mostrar barras de progreso durante el procesamiento.

### 2. Función `extraerfeatures(y, sr)`
Esta función extrae características acústicas de un segmento de audio:
- Calcula 13 coeficientes MFCC (Mel-Frequency Cepstral Coefficients) para representar el timbre.
- Obtiene el onset strength (fuerza de los golpes rítmicos).
- Calcula el chroma STFT (representación armónica en 12 notas musicales).
- Extrae características globales:
  - `tempo`: BPM de la canción.
  - `spectral_centroid`: Centro de gravedad del espectro de frecuencias.
  - `spectral_bandwidth`: Dispersión de frecuencias alrededor del centroid.
  - `rolloff`: Frecuencia por debajo de la cual está el 85% de la energía.
  - `zero_crossing_rate`: Tasa de cruces por cero (indica percusión).
  - `rms`: Energía promedio (volumen).
  - `chroma_stft`: Promedio del chroma (armonía).
  - `onset_strength_mean` y `std`: Media y desviación estándar de la fuerza rítmica.
  - `pitch_variance`: Varianza del chroma (estabilidad armónica).
  - `spectral_flux_std`: Desviación estándar del onset strength.
- Para cada MFCC, calcula media y desviación estándar.
- Retorna un diccionario con todas las características.

### 3. Configuración inicial
- Inicializa una lista `filas` para almacenar los datos.
- Define `carpeta_raiz = 'data/raw/songs'` como la ruta a los archivos de audio.
- Inicializa contadores de estadísticas: procesados, errores de lectura, canciones muy cortas.
- Lista los géneros como directorios en la carpeta raíz.

### 4. Bucle principal de procesamiento
Para cada género:
- Lista los archivos de audio (.mp3, .wav) en la carpeta del género.
- Para cada archivo:
  - Carga el audio con `librosa.load` y obtiene duración.
  - Aplica lógica de segmentación dinámica:
    - Si duración >= 85s: 3 segmentos (inicio, mitad, final).
    - Si >= 60s: 2 segmentos (inicio, final).
    - Si >= 30s: 1 segmento (único).
    - Si < 30s: salta la canción.
  - Para cada segmento:
    - Extrae el segmento de 30 segundos.
    - Verifica que tenga al menos 29 segundos para margen de seguridad.
    - Llama a `extraerfeatures` para obtener características.
    - Agrega columnas: `label` (género), `song_id` (archivo), `segment_type` (tipo de segmento).
    - Agrega el diccionario a `filas`.
  - Actualiza estadísticas.

### 5. Creación del DataFrame
- Crea un DataFrame de Pandas con la lista `filas`.
- Exporta a CSV: `dataset_musical_7_generos.csv`.

### 6. Reporte final
- Imprime estadísticas: canciones procesadas, saltadas, errores.
- Muestra distribución por género con `value_counts()`.

Este proceso genera un dataset estructurado listo para modelado, con características acústicas por segmento de audio.

## Estructura de carpetas

- `Data/ETL.ipynb` - notebook de extracción y procesamiento de audio.
- `Data/data/raw/songs/` - audio por género.

## Observación

El notebook fue actualizado para usar la ruta correcta de los archivos de audio: `data/raw/songs`.

Esta documentación refleja la fase realizada hasta ahora: extracción y preparación de datos. El proyecto todavía no ha avanzado a las etapas de modelado o despliegue de un sistema de identificación de géneros musicales.
