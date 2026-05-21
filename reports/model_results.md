# Resultados de Modelos — Clasificador de Géneros Musicales

## Resumen Ejecutivo

| Run | Técnica | Mejor Modelo | Accuracy | Macro F1 |
|-----|---------|-------------|----------|----------|
| 1 | Baseline | Voting (Linear + GB + RF) | 0.7352 | 0.7366 |
| 2 | SMOTE | Voting (Linear + GB + RF) | 0.7248 | 0.7261 |
| 3 | Optuna + SMOTE + FE | Voting (4 modelos) | **0.7549** | **0.76** |

---

## Run 1: Baseline (Sin SMOTE)

**Preprocesamiento:** GroupShuffleSplit 80/20 + StandardScaler

### Ranking General

| # | Modelo | Accuracy | Macro F1 |
|---|--------|----------|----------|
| 1 | Voting (Linear + GB + RF) | 0.7352 | 0.7366 |
| 2 | SVM (RBF) | 0.7196 | 0.7151 |
| 3 | Gradient Boosting | 0.7072 | 0.7108 |
| 4 | Random Forest | 0.6906 | 0.6844 |
| 5 | SVM (Linear) | 0.6791 | 0.6763 |
| 6 | LinearSVC | 0.6771 | 0.6671 |
| 7 | SVM (Poly) | 0.6355 | 0.6246 |

### Clasificación por Género — Mejor Modelo (Voting)

| Género | Precision | Recall | F1-Score | Support |
|--------|-----------|--------|----------|---------|
| Electronica | 0.65 | 0.60 | 0.62 | 155 |
| Hip-Hop | 0.68 | 0.60 | 0.64 | 98 |
| Rock | 0.63 | 0.66 | 0.64 | 86 |
| Vallenato | 0.93 | 0.78 | 0.85 | 129 |
| Clasicc | 0.97 | 0.97 | 0.97 | 149 |
| Jazz | 0.79 | 0.90 | 0.84 | 177 |
| Pop | 0.51 | 0.47 | 0.49 | 169 |

| | |
|---|---|
| **Accuracy** | 0.7352 |
| **Macro Avg** | P=0.74 / R=0.71 / F1=0.72 |
| **Weighted Avg** | P=0.74 / R=0.74 / F1=0.73 |

### Clasificación por Género — SVM (RBF)

| Género | Precision | Recall | F1-Score | Support |
|--------|-----------|--------|----------|---------|
| Electronica | 0.59 | 0.66 | 0.62 | 155 |
| Hip-Hop | 0.71 | 0.64 | 0.67 | 98 |
| Rock | 0.58 | 0.66 | 0.62 | 86 |
| Vallenato | 0.88 | 0.78 | 0.82 | 129 |
| Clasicc | 0.95 | 0.96 | 0.95 | 149 |
| Jazz | 0.85 | 0.86 | 0.85 | 177 |
| Pop | 0.48 | 0.44 | 0.46 | 169 |

### Clasificación por Género — Gradient Boosting

| Género | Precision | Recall | F1-Score | Support |
|--------|-----------|--------|----------|---------|
| Electronica | 0.70 | 0.63 | 0.66 | 155 |
| Hip-Hop | 0.64 | 0.66 | 0.65 | 98 |
| Rock | 0.60 | 0.81 | 0.69 | 86 |
| Vallenato | 0.83 | 0.78 | 0.80 | 129 |
| Clasicc | 0.97 | 0.93 | 0.95 | 149 |
| Jazz | 0.79 | 0.75 | 0.77 | 177 |
| Pop | 0.45 | 0.46 | 0.45 | 169 |

### Clasificación por Género — Random Forest

| Género | Precision | Recall | F1-Score | Support |
|--------|-----------|--------|----------|---------|
| Electronica | 0.65 | 0.66 | 0.65 | 155 |
| Hip-Hop | 0.59 | 0.61 | 0.60 | 98 |
| Rock | 0.57 | 0.79 | 0.66 | 86 |
| Vallenato | 0.78 | 0.73 | 0.76 | 129 |
| Clasicc | 0.97 | 0.94 | 0.95 | 149 |
| Jazz | 0.76 | 0.81 | 0.79 | 177 |
| Pop | 0.44 | 0.34 | 0.38 | 169 |

### Clasificación por Género — SVM (Linear)

| Género | Precision | Recall | F1-Score | Support |
|--------|-----------|--------|----------|---------|
| Electronica | 0.53 | 0.54 | 0.53 | 155 |
| Hip-Hop | 0.55 | 0.64 | 0.59 | 98 |
| Rock | 0.50 | 0.60 | 0.55 | 86 |
| Vallenato | 0.91 | 0.78 | 0.84 | 129 |
| Clasicc | 0.95 | 0.86 | 0.90 | 149 |
| Jazz | 0.82 | 0.79 | 0.80 | 177 |
| Pop | 0.51 | 0.52 | 0.52 | 169 |

### Clasificación por Género — SVM (Poly)

| Género | Precision | Recall | F1-Score | Support |
|--------|-----------|--------|----------|---------|
| Electronica | 0.65 | 0.66 | 0.66 | 155 |
| Hip-Hop | 0.52 | 0.40 | 0.45 | 98 |
| Rock | 0.49 | 0.74 | 0.59 | 86 |
| Vallenato | 0.73 | 0.70 | 0.71 | 129 |
| Clasicc | 0.95 | 0.95 | 0.95 | 149 |
| Jazz | 0.69 | 0.48 | 0.57 | 177 |
| Pop | 0.47 | 0.45 | 0.46 | 169 |

### Clasificación por Género — LinearSVC

| Género | Precision | Recall | F1-Score | Support |
|--------|-----------|--------|----------|---------|
| Electronica | 0.58 | 0.55 | 0.56 | 155 |
| Hip-Hop | 0.53 | 0.67 | 0.59 | 98 |
| Rock | 0.49 | 0.55 | 0.52 | 86 |
| Vallenato | 0.90 | 0.82 | 0.86 | 129 |
| Clasicc | 0.97 | 0.86 | 0.91 | 149 |
| Jazz | 0.79 | 0.75 | 0.77 | 177 |
| Pop | 0.50 | 0.48 | 0.49 | 169 |

### Desempeño por Género — Todos los Modelos (F1-Score)

| Género | Voting | SVM RBF | GB | RF | SVM Linear | SVM Poly | LinearSVC |
|--------|--------|---------|-----|-----|------------|----------|-----------|
| Clasicc | **0.97** | 0.95 | 0.95 | 0.95 | 0.90 | 0.95 | 0.91 |
| Jazz | 0.84 | **0.85** | 0.77 | 0.79 | 0.80 | 0.57 | 0.77 |
| Vallenato | 0.85 | 0.82 | 0.80 | 0.76 | 0.84 | 0.71 | **0.86** |
| Rock | 0.64 | 0.62 | **0.69** | 0.66 | 0.55 | 0.59 | 0.52 |
| Hip-Hop | 0.64 | **0.67** | 0.65 | 0.60 | 0.59 | 0.45 | 0.59 |
| Electronica | 0.62 | 0.62 | **0.66** | 0.65 | 0.53 | 0.66 | 0.56 |
| Pop | 0.49 | 0.46 | 0.45 | 0.38 | **0.52** | 0.46 | 0.49 |

---

## Run 2: Con SMOTE

SMOTE aplicado al training set. Mismo test set que Run 1 para comparación justa.

| Modelo | Accuracy | Macro F1 | Δ vs Run 1 |
|--------|----------|----------|------------|
| Voting (Linear + GB + RF) | 0.7248 | 0.7261 | -0.0105 |
| SVM (RBF) | 0.7165 | 0.7123 | -0.0028 |
| Gradient Boosting | 0.6864 | 0.6908 | -0.0200 |
| Random Forest | 0.6833 | 0.6769 | -0.0075 |
| SVM (Linear) | 0.6729 | 0.6717 | -0.0046 |

**Conclusión:** SMOTE no mejoró ningún modelo. El Voting Classifier sigue siendo el mejor incluso con la caída de rendimiento.

---

## Run 3: Optuna + SMOTE + Feature Engineering

### Configuración

- **Ensamble:** VotingClassifier soft-voting con 4 estimadores:
  - SVM (Linear)
  - SVM (RBF)
  - Random Forest
  - Gradient Boosting
- **SMOTE:** Sí
- **Feature Engineering:** Sí
- **Optuna:** 20 trials, optimizando Macro F1 en CV

### Espacio de Búsqueda de Hiperparámetros

| Estimador | Hiperparámetro | Rango |
|-----------|---------------|-------|
| SVM (RBF) | C | 0.1 - 100 |
| SVM (RBF) | gamma | 0.001 - 1 |
| Random Forest | n_estimators | 100 - 500 |
| Random Forest | max_depth | 10 - 50 |
| Gradient Boosting | learning_rate | 0.01 - 0.5 |
| Gradient Boosting | n_estimators | 50 - 200 |

### Mejores Hiperparámetros Encontrados

```
svc_rbf_c:          70.27
svc_rbf_gamma:      0.0207
rf_n_estimators:    480
rf_max_depth:       39
gb_learning_rate:   0.2667
gb_n_estimators:    93
```

### Mejor CV Score (Optuna)

**Macro F1:** 0.8386

### Evaluación en Test Set

| Métrica | Valor |
|---------|-------|
| **Accuracy** | **0.7549** |
| **Macro Precision** | 0.76 |
| **Macro Recall** | 0.76 |
| **Macro F1** | **0.76** |
| **Weighted F1** | 0.76 |

---

## Comparativa Final

| Run | Accuracy | Macro F1 | Mejora |
|-----|----------|----------|--------|
| Run 1 — Baseline | 0.7352 | 0.7366 | — |
| Run 2 — SMOTE | 0.7248 | 0.7261 | -1.4% |
| Run 3 — Optuna + SMOTE + FE | **0.7549** | **0.76** | +2.7% |

---

## Análisis de Errores por Género

### Géneros Fáciles (F1 > 0.80)

- **Clasicc:** Consistentemente el más fácil (F1 0.90-0.97). Features bien separadas del resto.
- **Jazz:** Muy buen desempeño (F1 0.77-0.85). Confundido ocasionalmente con Electrónica.
- **Vallenato:** Buen desempeño (F1 0.71-0.86). Ritmo y tonalidad distintivos.

### Géneros Difíciles (F1 < 0.70)

- **Pop:** Consistentemente el peor (F1 0.38-0.52). Confundido con Rock, Electrónica y Jazz.
- **Rock:** Segundo peor (F1 0.52-0.69). Principal confusión con Pop por superposición espectral (rolloff).
- **Electrónica:** Tercer peor (F1 0.53-0.66). Confundido con Jazz y Pop.

### Matriz de Confusión — Voting Classifier (Run 1)

Las matrices de confusión para todos los modelos del Run 1 están en `reports/figures/1st_try/`:

| Archivo | Modelo |
|---------|--------|
| `confusion_matrix_Voting_Linear_GB_RF.png` | Voting (Linear + GB + RF) |
| `confusion_matrix_SVM_RBF.png` | SVM (RBF) |
| `confusion_matrix_SVM_Linear.png` | SVM (Linear) |
| `confusion_matrix_SVM_Poly.png` | SVM (Poly) |
| `confusion_matrix_Random_Forest.png` | Random Forest |
| `confusion_matrix_Gradient_Boosting.png` | Gradient Boosting |
| `confusion_matrix_LinearSVC.png` | LinearSVC |

---

## Conclusiones

1. **Los ensambles son superiores:** Voting Classifier ganó en todos los runs.
2. **SMOTE no es beneficioso por sí solo:** Redujo rendimiento en todos los modelos (-0.3% a -2%).
3. **Optuna + Feature Engineering es la combinación ganadora:** +2% sobre el baseline.
4. **GroupShuffleSplit es crítico:** Sin él habría data leakage y métricas artificialmente infladas.
5. **Pop y Rock necesitan features más discriminativas:** La superposición espectral limita la separación.
6. **El mejor modelo alcanza 75.49% accuracy y 0.76 Macro F1** para clasificación de 7 géneros con audios de dominio público.
