# Proceso Completo: Clasificador de Géneros Musicales

## Índice

1. [Obtención de Datos](#1-obtención-de-datos)
2. [Extracción de Features (ETL)](#2-extracción-de-features-etl)
3. [Preprocesamiento](#3-preprocesamiento)
4. [Modelado](#4-modelado)
5. [Resultados](#5-resultados)

---

## 1. Obtención de Datos

**Fuente:** [Free Music Archive](https://freemusicarchive.org) — plataforma de distribución musical bajo licencias Creative Commons.

Las canciones fueron seleccionadas y organizadas manualmente por género musical, con un mínimo de 50 pistas por categoría. Los archivos se almacenan en `Canciones/` organizados en subdirectorios por género:

```
Canciones/
├── clasicc/
├── Electronica/
├── Hip-Hop/
├── jazz/
├── pop/
├── Rock/
└── Vallenato/
```

**Total:** 7 géneros, aproximadamente 400+ canciones en formato MP3/WAV.

---

## 2. Extracción de Features (ETL)

**Notebook:** `01_audio_feature_extraction.ipynb`

### Librerías utilizadas

| Librería | Propósito |
|----------|----------|
| **Librosa** | Cargar archivos de audio y extraer características acústicas |
| **NumPy** | Operaciones numéricas vectorizadas |
| **Pandas** | Construcción y exportación del dataset en CSV |
| **OS** | Recorrer carpetas de géneros y construir rutas |
| **Joblib** | Procesamiento paralelo de canciones |
| **tqdm** | Barras de progreso |

### Requisito: FFmpeg

Librosa necesita FFmpeg para decodificar archivos MP3. Instalación: `winget install ffmpeg`.

### Pipeline de Extracción

Para cada canción se carga la pista completa y se extraen segmentos de audio de 30 segundos. La estrategia de segmentación depende de la duración:

| Duración de la canción | Segmentos extraídos |
|------------------------|---------------------|
| ≥ 85 segundos | 3 segmentos: inicio, mitad, final |
| ≥ 60 segundos | 2 segmentos: inicio, final |
| ≥ 30 segundos | 1 segmento: único |
| < 30 segundos | Descartada (demasiado corta) |

Cada segmento se procesa mediante la función `extraerfeatures(y, sr)` que calcula **47 features acústicas**.

### 47 Features Extraídas por Segmento

#### 11 Features Globales

| Feature | Descripción |
|---------|-------------|
| `tempo` | Tempo estimado en BPM |
| `spectral_centroid` | Centroide espectral (brillo del sonido) |
| `spectral_bandwidth` | Ancho de banda espectral |
| `rolloff` | Frecuencia de rolloff espectral |
| `zero_crossing_rate` | Tasa de cruce por cero (ruido/tonalidad) |
| `rms` | Energía RMS (volumen) |
| `chroma_stft` | Croma promedio (contenido armónico) |
| `onset_strength_mean` | Fuerza de onset promedio |
| `onset_strength_std` | Desviación estándar de fuerza de onset |
| `pitch_variance` | Varianza tonal |
| `spectral_flux_std` | Flujo espectral (cambios en frecuencia) |

#### 26 Coeficientes MFCC

MFCC 1 a 13, cada uno con su media y desviación estándar:
`mfcc1_mean`, `mfcc1_std`, ..., `mfcc13_mean`, `mfcc13_std`

#### 10 Features Avanzadas

| Feature | Descripción |
|---------|-------------|
| `harm_perc_ratio` | Ratio energía armónica / percusiva |
| `spectral_flatness_mean` | Planitud espectral (tonal vs. ruidoso) |
| `tonnetz_0_std` a `tonnetz_5_std` | 6 coeficientes de red tonal |
| `tempo_cv` | Variabilidad del tempo |
| `bass_ratio` | Ratio graves / agudos |

### Estructura del Dataset Final

Cada fila del CSV representa un segmento con **50 columnas**:
- 47 features acústicas
- `label`: género musical
- `song_id`: nombre del archivo de origen
- `segment_type`: tipo de segmento (inicio, mitad, final, único)

### Procesamiento Paralelo

El ETL usa `joblib.Parallel` con `n_jobs=-1` para utilizar todos los núcleos de CPU disponibles, procesando cientos de canciones en paralelo.

**Salidas generadas:**
- `data/songs/audio_features_v1_30s.csv` — Segmentos de 30 segundos
- `data/songs/audio_features_15s.csv` — Segmentos de 15 segundos

---

## 3. Preprocesamiento

**Notebook:** `03_model_training.ipynb`

El dataset usado para entrenamiento es `audio_features_15s.csv`.

### Pasos de Preprocesamiento

1. **Separación de variables**
   ```python
   X = df.drop(columns=['label', 'song_id', 'segment_type'])  # 47 features
   y = df['label']                                              # género
   groups = df['song_id']                                       # para split por canción
   ```

2. **Label Encoding**: Los géneros (strings) se codifican a valores numéricos.

3. **GroupShuffleSplit**: Split 80/20 respetando que segmentos de una misma canción **no** estén en train y test simultáneamente. Esto evita data leakage y simula un escenario realista donde el modelo clasifica canciones nunca antes vistas.
   ```python
   gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=9347234)
   train_idx, test_idx = next(gss.split(X, y_encoded, groups))
   ```

4. **StandardScaler**: Estandarización de features (media=0, std=1).

5. **SMOTE** (Synthetic Minority Over-sampling): Balanceo de clases en el conjunto de entrenamiento para compensar géneros con menos muestras.

6. **Feature Engineering** (Run 3): Creación de features derivadas para mejorar separación.

---

## 4. Modelado

### 4.1 Modelos Evaluados

Se entrenaron y compararon **7 modelos**:

| # | Modelo | Tipo |
|---|--------|------|
| 1 | SVM (RBF) | Support Vector Machine con kernel RBF |
| 2 | Random Forest | 100 estimadores |
| 3 | Gradient Boosting | 100 estimadores |
| 4 | SVM (Linear) | SVM con kernel lineal |
| 5 | SVM (Poly) | SVM con kernel polinomial (degree=3) |
| 6 | LinearSVC | Linear SVC con calibración de probabilidades |
| 7 | Voting (Linear + GB + RF) | Ensamble soft-voting de 3 modelos |

### 4.2 Run 1: Baseline (Sin SMOTE)

Evaluación base de los 7 modelos sobre los datos originales sin balanceo.

| Pos | Modelo | Accuracy | Macro F1 |
|-----|--------|----------|----------|
| 1 | Voting (Linear + GB + RF) | 0.7352 | 0.7366 |
| 2 | SVM (RBF) | 0.7196 | 0.7151 |
| 3 | Gradient Boosting | 0.7072 | 0.7108 |
| 4 | Random Forest | 0.6906 | 0.6844 |
| 5 | SVM (Linear) | 0.6791 | 0.6763 |
| 6 | LinearSVC | 0.6771 | 0.6671 |
| 7 | SVM (Poly) | 0.6355 | 0.6246 |

**Observación:** El ensamble Voting Classifier superó a todos los modelos individuales. Los géneros con peor desempeño fueron **Pop** (F1 ~0.46) y **Rock** (~0.62-0.69) por la superposición de features en el espacio espectral (particularmente spectral rolloff). Los mejores géneros fueron **Clasicc** (F1 ~0.95) y **Jazz** (~0.85).

### 4.3 Run 2: Con SMOTE

Mismos modelos reentrenados con SMOTE aplicado al training set. Mismo test set que Run 1 para comparación justa.

| Modelo | Accuracy | Macro F1 |
|--------|----------|----------|
| Voting (Linear + GB + RF) | 0.7248 | 0.7261 |
| SVM (RBF) | 0.7165 | 0.7123 |
| Gradient Boosting | 0.6864 | 0.6908 |
| Random Forest | 0.6833 | 0.6769 |
| SVM (Linear) | 0.6729 | 0.6717 |

**Conclusión:** SMOTE no mejoró el rendimiento. Incluso empeoró ligeramente.

### 4.4 Run 3: Optuna + SMOTE + Feature Engineering

#### Configuración

- **Ensamble:** VotingClassifier con 4 estimadores base:
  - SVM (Linear)
  - SVM (RBF)
  - Random Forest
  - Gradient Boosting
- **SMOTE:** Aplicado al training set
- **Feature Engineering:** Features derivadas adicionales
- **Optuna:** 20 trials de búsqueda de hiperparámetros con validación cruzada

#### Hiperparámetros Optimizados

Optuna exploró los siguientes parámetros:

| Estimador | Hiperparámetro | Rango |
|-----------|---------------|-------|
| SVM (RBF) | C | 0.1 - 100 |
| SVM (RBF) | gamma | 0.001 - 1 |
| Random Forest | n_estimators | 100 - 500 |
| Random Forest | max_depth | 10 - 50 |
| Gradient Boosting | learning_rate | 0.01 - 0.5 |
| Gradient Boosting | n_estimators | 50 - 200 |

**Mejores parámetros encontrados:**
```
svc_rbf_c: 70.27
svc_rbf_gamma: 0.0207
rf_n_estimators: 480
rf_max_depth: 39
gb_learning_rate: 0.2667
gb_n_estimators: 93
```

**Mejor CV Macro F1 durante Optuna:** 0.8386

#### Resultado Final en Test Set

| Métrica | Valor |
|---------|-------|
| Accuracy | 0.7549 |
| Macro Precision | 0.76 |
| Macro Recall | 0.76 |
| Macro F1 | 0.76 |
| Weighted F1 | 0.76 |

---

## 5. Resultados

### Mejor Modelo

**Voting Classifier con Optuna** (Run 3):

| Métrica | Valor |
|---------|-------|
| Accuracy | **75.49%** |
| Macro F1 | **0.76** |

### Comparativa de Mejores Modelos por Run

| Run | Modelo | Accuracy | Macro F1 |
|-----|--------|----------|----------|
| 1 | Voting (Linear + GB + RF) | 73.52% | 0.7366 |
| 2 | Voting (Linear + GB + RF) + SMOTE | 72.48% | 0.7261 |
| 3 | Voting (4 modelos) + Optuna + SMOTE | **75.49%** | **0.76** |

### Géneros con Mejor y Peor Desempeño (Run 1)

| Género | F1-Score | Clasificación |
|--------|----------|---------------|
| Clasicc | 0.95 | Más fácil |
| Jazz | 0.85 | |
| Vallenato | 0.82 | |
| Hip-Hop | 0.67 | |
| Rock | 0.62 | |
| Electrónica | 0.62 | |
| Pop | 0.46 | Más difícil |

**Nota:** Rock y Pop fueron consistentemente los géneros más difíciles de distinguir debido a la superposición de features espectrales.

### Matrices de Confusión

Generadas para todos los modelos del Run 1, guardadas en `reports/figures/1st_try/`:

```
confusion_matrix_Voting_Linear_GB_RF.png
confusion_matrix_SVM_RBF.png
confusion_matrix_SVM_Linear.png
confusion_matrix_SVM_Poly.png
confusion_matrix_Random_Forest.png
confusion_matrix_Gradient_Boosting.png
confusion_matrix_LinearSVC.png
```

### Conclusiones Clave

1. **Los ensambles superan a los modelos individuales:** Voting Classifier consistentemente obtuvo los mejores resultados en todos los runs.
2. **SMOTE por sí solo no mejora el rendimiento** cuando hay suficiente representación de clases, incluso puede degradarlo ligeramente.
3. **Optuna + Feature Engineering** aportó la mayor ganancia (+2% sobre el baseline sin tuning).
4. **GroupShuffleSplit es crítico** para evitar data leakage: segmentos de una misma canción nunca se reparten entre train y test.
5. **Pop y Rock** requieren features más discriminativas o datos adicionales para mejorar su clasificación.
