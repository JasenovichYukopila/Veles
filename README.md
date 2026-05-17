# Veles 🎶

[![Python Version](https://img.shields.io/badge/python-3.14+-blue.svg)](https://www.python.org/)
[![Librosa](https://img.shields.io/badge/librosa-0.10.x-orange.svg)](https://librosa.org/)
[![Pandas](https://img.shields.io/badge/pandas-2.x-purple.svg)](https://pandas.pydata.org/)

**Veles** es un motor de ingeniería de características y clasificación inteligente de géneros musicales. El proyecto implementa un pipeline de procesamiento digital de señales (DSP) optimizado para transformar archivos de audio crudos (`.mp3` y `.wav`) en matrices de datos estructuradas de alta densidad mediante técnicas de segmentación por ventanas deslizantes y aprendizaje estadístico.

### 1. Extracción y Segmentación Dinámica (ETL v3)
Para contrarrestar la escasez de datos típica en tareas de audio, implementamos un enfoque de **Ventanas Deslizantes (Sliding Windows)** secuenciales que multiplica exponencialmente el volumen de registros explotables:
* **Duración de Ventana:** 15 segundos por segmento.
* **Solapamiento (Overlap):** 1 segundo entre ventanas consecutivas (paso efectivo de 14 segundos).
* **Control de Sesgo por Duración:** Dado que géneros como la música clásica o el jazz tienen pistas nativamente más largas que el pop o hip-hop, el script impone un **tope máximo de 15 segmentos aleatorios por canción** (`MAX_SEGMENTOS_POR_CANCION = 15`), garantizando un dataset balanceado desde la raíz y previniendo el sobreajuste (*overfitting*).

### 2. Matriz de Características Extráidas (40 Columnas)
Por cada ventana de 15 segundos extraída, el motor calcula un vector de **37 características físicas de audio** combinadas con 3 variables de metadatos:

| Tipo de Feature | Características Calculadas | Descripción |
| :--- | :--- | :--- |
| **Temporales & Ritmo** | `tempo` | Estimación de Beats Per Minute (BPM). |
| **Energía & Amplitud** | `rms` | Valor cuadrático medio de la señal (potencia acústica). |
| **Espectrales** | `spectral_centroid`, `spectral_bandwidth`, `rolloff` | Centro de masa, dispersión y frecuencia de corte del espectro. |
| **Frecuenciales** | `zero_crossing_rate`, `spectral_flux_std` | Tasa de cambio de signo e irregularidad del flujo espectral. |
| **Tímbricas** | `mfcc1_mean` a `mfcc13_mean` y `mfcc1_std` a `mfcc13_std` | 13 Coeficientes Cestrales en las Frecuencias de Mel (Medias y Desviaciones). |
| **Armónicas / Tonalidad** | `chroma_stft`, `pitch_variance` | Distribución de la energía en las doce semitonas de la escala musical. |
| **Rítmicas Avanzadas** | `onset_strength_mean`, `onset_strength_std` | Fuerza y consistencia de los inicios de nota. |
| **Metadatos** | `label`, `song_id`, `segment_type` | Identificadores estructurales y de supervisión. |

---

### 3. Próxima Fase: Entrenamiento de Modelos Predictivos

Con el dataset balanceado exportado exitosamente en `data/dataset_15s_overlap.csv`, la siguiente etapa comprende el modelado bajo una arquitectura de clasificador por votación blanda (**Soft Voting Classifier**):
