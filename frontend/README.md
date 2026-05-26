# Veles — Frontend

Aplicación web de Veles construida con React, TypeScript y Vite. Ofrece dos modos de uso:

1. **Clasificación acústica en tiempo real**: Grabación de audio, inferencia de género musical, y recomendaciones personalizadas de Spotify.
2. **Dashboard empresarial**: KPIs de mercado, gráficos interactivos (barras, doughnuts, metas), overlays con análisis estadístico, y filtros por género.

## Scripts

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo → http://localhost:5173
npm run build        # Build de producción
npm run preview      # Previsualizar build de producción
```

## Arquitectura

La aplicación usa un sistema de **stages** (estados) controlado por `App.tsx`. No hay router tradicional — cada stage es un componente React que se monta/desmonta según el estado actual.

```
src/
├── App.tsx                  # Estado global: Stage actual + callbacks
├── types/index.ts           # Genre (7), Stage (8), BusinessMetric, etc.
├── constants/index.ts       # GENRE_INFO, RECORDING_DURATION_MS, API_BASE_URL
├── services/
│   ├── classifier.ts        # POST /classify → { genre, confidence }
│   └── dashboard.ts          # GET /dashboard/business, GET /dashboard/personal
├── hooks/
│   └── useAudioRecorder.ts  # MediaRecorder → Blob → POST /classify
└── components/
    ├── ProgressBar/              # Barra de progreso (5 etapas)
    ├── shared/
    │   └── WaveformVisualizer.tsx   # Canvas + Web Audio API
    └── stages/
        ├── StageLanding/         # Pantalla de bienvenida
        ├── StageMenu/            # Menú: Clasificación vs Dashboard
        ├── StageIdle/            # Listo para grabar
        ├── StageRecording/       # Grabación con waveform animado
        ├── StageProcessing/      # Análisis en progreso (barras animadas)
        ├── StageResult/          # Resultado: género + confianza + acciones
        ├── StageDetail/          # Recomendaciones Spotify expandibles
        └── StageDashboard/       # Dashboard empresarial
            ├── StageDashboard.tsx
            ├── DashboardMenu.tsx
            ├── BusinessView.tsx  # KPIs, gráficos, tabla, sidebar
            ├── DashboardSidebar.tsx
            ├── GenreSidebarPanel.tsx
            ├── DashboardInsights.tsx
            ├── ChartOverlay.tsx   # Modal de zoom con análisis
            └── StageDashboard.css # 1700+ líneas de CSS
```

## Endpoints consumidos

El frontend conecta con `http://localhost:8000`:

| Endpoint | Descripción |
|----------|-------------|
| `POST /classify` | Cuerpo: `multipart/form-data` con `file` (audio/*). Respuesta: `{ genre, confidence }` |
| `GET /dashboard/business` | Sin parámetros. Respuesta: `{ data: BusinessMetric[] }` |
| `GET /dashboard/personal?genre=X` | Query param `genre`. Respuesta: `{ data: PersonalRecommendation[] }` |

## Dashboard Empresarial

El `StageDashboard` (`BusinessView`) incluye:

- **Gráfico de barras** — Potencial de ganancia por género con línea de promedio
- **Gráfico de doughnuts** — Distribución H/M por género en grid de tarjetas SVG
- **Tarjetas de metas** — Progreso hacia meta, meta vs actual, tendencia
- **Tabla resumen** — 9 columnas ordenables
- **Zoom con análisis** — Al hacer clic en cualquier gráfico: overlay con análisis estadístico
- **Sidebar de filtro** — 15 KPIs detallados por género seleccionado
- **Insights estratégicos** — Texto narrativo por género

El zoom filtra datos cuando hay un género seleccionado (filtrado de overlayData, overlaySortedByRevenue, etc.).

## Notas

- `--genre-color` y `--genre-color-rgb` son CSS custom properties que cambian según el género detectado/clasificado.
- El dashboard no requiere clasificación previa — es accesible desde el menú principal directamente.
- El Recording usa `getUserMedia` y graba exactamente 15 segundos (`RECORDING_DURATION_MS = 15000`).