import { useEffect, useState } from 'react';
import type { Genre, BusinessMetric } from '../../../types';
import { GENRE_INFO } from '../../../constants';
import { fetchBusinessMetrics } from '../../../services/dashboard';
import './StageDashboard.css';

function hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

type DashboardView = 'menu' | 'business';

interface StageDashboardProps {
    genre?: Genre;
    onReset: () => void;
}

export function StageDashboard({ genre, onReset }: StageDashboardProps) {
    const [view, setView] = useState<DashboardView>('menu');

    return (
        <section className="stage-dashboard">
            <div className="stage-dashboard__content">
                {view === 'menu' && (
                    <DashboardMenu genre={genre} onSelect={setView} onReset={onReset} />
                )}
                {view === 'business' && (
                    <BusinessView genre={genre ?? null} onBack={() => setView('menu')} />
                )}

            </div>
        </section>
    );
}

/* ─── Menu ─────────────────────────────────── */

interface DashboardMenuProps {
    genre?: Genre;
    onSelect: (view: DashboardView) => void;
    onReset: () => void;
}

function DashboardMenu({ genre, onSelect, onReset }: DashboardMenuProps) {
    return (
        <div className="dashboard-menu">
            <span className="dashboard-menu__label">Dashboard</span>
            <h2 className="dashboard-menu__title">Explora los datos</h2>
            {genre && (
                <p className="dashboard-menu__subtitle">
                    Basado en el género detectado: <strong>{genre}</strong>
                </p>
            )}

            <div className="dashboard-menu__cards">
                <button className="dashboard-menu__card" onClick={() => onSelect('business')}>
                    <div className="dashboard-menu__card-icon">
                        <BusinessIcon />
                    </div>
                    <div className="dashboard-menu__card-body">
                        <h3 className="dashboard-menu__card-title">Empresarial</h3>
                        <p className="dashboard-menu__card-desc">
                            KPIs de mercado, metas de ingresos y demografía de audiencia
                            por género musical.
                        </p>
                        <span className="dashboard-menu__card-action">Ver dashboard →</span>
                    </div>
                </button>

            </div>

            <button className="dashboard-menu__reset" onClick={onReset}>
                ← Volver al menú
            </button>
        </div>
    );
}

function DashboardLoading() {
    return (
        <div className="dashboard-view">
            <div className="dashboard-loading">
                <div className="dashboard-loading__bars">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="dashboard-loading__bar" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
                <p className="dashboard-loading__text">Cargando datos...</p>
            </div>
        </div>
    );
}

interface DashboardErrorProps {
    message: string;
    onRetry: () => void;
}

function DashboardError({ message, onRetry }: DashboardErrorProps) {
    return (
        <div className="dashboard-view">
            <div className="dashboard-error">
                <p className="dashboard-error__message">{message}</p>
                <button className="dashboard-error__btn" onClick={onRetry}>
                    Reintentar
                </button>
            </div>
        </div>
    );
}

/* ─── Insights Banner ────────────────────────── */

function DashboardInsights({ data, selectedGenre }: { data: BusinessMetric[], selectedGenre: string | null }) {
    if (data.length === 0) return null;

    if (selectedGenre) {
        const d = data.find(i => i.genero === selectedGenre);
        if (!d) return null;

        const roi = d.roi_estimado_pct?.toFixed(1);
        const trend = d.tendencia_crecimiento_pct;
        const explicit = d.porcentaje_explicitos;

        const insights: Record<string, string> = {
            'Pop': `<strong>${d.genero}</strong> es un mercado maduro y de bajo riesgo con un potencial de <strong>$${(d.potencial_ganancia_usd / 1000).toFixed(0)}K</strong>, un ROI proyectado del <strong>${roi}%</strong> y una audiencia mayoritariamente femenina (${d.porcentaje_mujeres.toFixed(0)}%) con un promedio de ${d.edad_promedio_oyente.toFixed(0)} años.`,
            'Hip-Hop': `<strong>${d.genero}</strong> representa la mayor oportunidad de expansión con un crecimiento del <strong>${trend}%</strong> anual, a pesar de tener el contenido más explícito del catálogo (<strong>${explicit?.toFixed(0)}%</strong>).`,
            'Vallenato': `<strong>${d.genero}</strong> destaca como un mercado local de alta fidelidad y bajo riesgo, con un crecimiento saludable del <strong>${trend}%</strong> y un catálogo <strong>100% libre de contenido explícito</strong>, ideal para marcas tradicionales.`,
            'Electrónica': `<strong>${d.genero}</strong> muestra un equilibrio sólido entre riesgo y retorno, con un potencial de <strong>$${(d.potencial_ganancia_usd / 1000).toFixed(0)}K</strong> y una audiencia joven de ${d.edad_promedio_oyente.toFixed(0)} años.`,
            'Rock': `<strong>${d.genero}</strong> mantiene un volumen de ingresos alto, aunque su tendencia es ligeramente negativa (<strong>${trend}%</strong>), sugiriendo la necesidad de optimizar el catálogo actual.`,
            'Clásica': `<strong>${d.genero}</strong> es un mercado estable, de riesgo medio y baja volatilidad, con una audiencia premium de edad promedio de ${d.edad_promedio_oyente.toFixed(0)} años.`,
            'Jazz': `<strong>${d.genero}</strong> es un nicho especializado con riesgo elevado debido a tendencias decrecientes, pero mantiene una base leal de oyentes adultos.`,
        };

        return (
            <div className="dashboard-insights">
                <div className="dashboard-insights__content">
                    <span className="dashboard-insights__label">Análisis Estratégico</span>
                    <p className="dashboard-insights__text" dangerouslySetInnerHTML={{ __html: insights[d.genero] || `Análisis detallado para el género ${d.genero}.` }} />
                </div>
            </div>
        );
    }

    const topRevenue = [...data].sort((a, b) => b.potencial_ganancia_usd - a.potencial_ganancia_usd)[0];
    const topGrowth = [...data].sort((a, b) => b.tendencia_crecimiento_pct - a.tendencia_crecimiento_pct)[0];

    return (
        <div className="dashboard-insights">
            <div className="dashboard-insights__content">
                <span className="dashboard-insights__label">Vista General del Mercado</span>
                <p className="dashboard-insights__text">
                    <strong>{topRevenue.genero}</strong> lidera el potencial de ingresos con <strong>${(topRevenue.potencial_ganancia_usd / 1000).toFixed(0)}K</strong> 
                    ({topRevenue.cumplimiento_meta_pct.toFixed(0)}% de meta), mientras que <strong>{topGrowth.genero}</strong> es la mayor 
                    oportunidad de expansión con un crecimiento proyectado del <strong>{topGrowth.tendencia_crecimiento_pct}%</strong> anual.
                </p>
            </div>
        </div>
    );
}

/* ─── Business View ──────────────────────────── */

interface BusinessViewProps {
    genre: string | null;
    onBack: () => void;
}

function BusinessView({ genre, onBack }: BusinessViewProps) {
    const [data, setData] = useState<BusinessMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('potencial_ganancia_usd');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [expandedChart, setExpandedChart] = useState<'potencial' | 'demografia' | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetchBusinessMetrics()
            .then((result) => {
                if (!cancelled) { setData(result); setLoading(false); }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Error al cargar datos');
                    setLoading(false);
                }
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const targetGenre = selectedGenre ?? genre;
        if (targetGenre && targetGenre in GENRE_INFO) {
            const info = GENRE_INFO[targetGenre as Genre];
            root.style.setProperty('--genre-color', info.color);
            root.style.setProperty('--genre-color-rgb', hexToRgb(info.color));
        } else {
            root.style.setProperty('--genre-color', '#7C3AED');
            root.style.setProperty('--genre-color-rgb', '124, 58, 237');
        }
    }, [selectedGenre, genre]);

    if (loading) return <DashboardLoading />;
    if (error) return <DashboardError message={error} onRetry={() => window.location.reload()} />;

    const sortedByRevenue = [...data].sort((a, b) => b.potencial_ganancia_usd - a.potencial_ganancia_usd);
    const maxRevenue = Math.max(...data.map((d) => d.potencial_ganancia_usd), 1);
    const avgRevenue = data.reduce((s, d) => s + d.potencial_ganancia_usd, 0) / (data.length || 1);
    const selectedData = selectedGenre ? data.find((d) => d.genero === selectedGenre) : null;

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const sortedData = [...data].sort((a, b) => {
        const mult = sortDir === 'asc' ? 1 : -1;
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === 'string' && typeof bv === 'string') {
            return av.localeCompare(bv) * mult;
        }
        if (av == null) return 1;
        if (bv == null) return -1;
        return ((av as number) - (bv as number)) * mult;
    });

    const rowClass = (g: string) =>
        selectedGenre
            ? g === selectedGenre ? 'dashboard-chart__row--focused' : 'dashboard-chart__row--unfocused'
            : '';

    const vbarClass = (g: string) =>
        selectedGenre
            ? g === selectedGenre ? 'dashboard-chart__vbar-group--focused' : 'dashboard-chart__vbar-group--unfocused'
            : '';

    const topGenre = sortedData[0]?.genero ?? '';

    const goalData = selectedGenre
        ? data.filter((d) => d.genero === selectedGenre)
        : [...data].sort((a, b) => b.cumplimiento_meta_pct - a.cumplimiento_meta_pct);

    const tableData = selectedGenre
        ? sortedData.filter((d) => d.genero === selectedGenre)
        : sortedData;

        return (
            <>
            <div className="dashboard-view dashboard-view--business">
                <div className="dashboard-business__layout">
                    <div className="dashboard-view__header">
                        <button className="dashboard-view__back" onClick={onBack}>← Volver</button>
                        <div>
                            <span className="dashboard-view__label">Dashboard Empresarial</span>
                            <h2 className="dashboard-view__title">Métricas de Mercado</h2>
                        </div>
                    </div>

                    <DashboardInsights data={data} selectedGenre={selectedGenre} />

                    {/* ── Left panel: Sidebar only ── */}
                    <div className="dashboard-business__left">
                        <DashboardSidebar
                            data={data}
                            selectedGenre={selectedGenre}
                            selectedData={selectedData}
                            onSelect={setSelectedGenre}
                        />
                    </div>

                    {/* ── Right panel ── */}
                    <div className="dashboard-business__main">
                        {/* ── Potencial + Demografía ── */}
                        <div className="dashboard-business__charts">
                            <div className="dashboard-business__chart dashboard-business__chart--clickable" onClick={() => setExpandedChart('potencial')}>
                                <h3 className="dashboard-chart__title">Potencial de ganancia</h3>
                                <div className="dashboard-chart__bars-vertical">
                                    {sortedByRevenue.map((item) => (
                                        <div key={item.genero} className={`dashboard-chart__vbar-group ${vbarClass(item.genero)}`}>
                                            <div className="dashboard-chart__vbar-label">{item.genero}</div>
                                            <div className="dashboard-chart__vbar-track">
                                                <div
                                                    className="dashboard-chart__vbar-fill"
                                                    style={{ height: `${(item.potencial_ganancia_usd / maxRevenue) * 100}%` }}
                                                />
                                                <div
                                                    className="dashboard-chart__vbar-avg-line"
                                                    style={{ bottom: `${(avgRevenue / maxRevenue) * 100}%` }}
                                                />
                                            </div>
                                            <span className="dashboard-chart__vbar-value">
                                                ${(item.potencial_ganancia_usd / 1000).toFixed(0)}K
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="dashboard-chart__avg-legend">
                                    <span className="dashboard-chart__avg-line-sample" />
                                    <span>Prom: ${(avgRevenue / 1000).toFixed(0)}K</span>
                                </div>
                            </div>

                            <div className="dashboard-business__chart dashboard-business__chart--clickable" onClick={() => setExpandedChart('demografia')}>
                                <h3 className="dashboard-chart__title">Demografía por género</h3>
                                <div className="dashboard-chart__table">
                                    {data.map((item) => (
                                        <div key={item.genero} className={`dashboard-chart__row ${rowClass(item.genero)}`}>
                                            <span className="dashboard-chart__row-label">{item.genero}</span>
                                            <div className="dashboard-chart__row-bars">
                                                <div className="dashboard-chart__bar-group">
                                                    <div
                                                        className="dashboard-chart__bar dashboard-chart__bar--male"
                                                        style={{ width: `${item.porcentaje_hombres}%` }}
                                                    />
                                                    <div
                                                        className="dashboard-chart__bar dashboard-chart__bar--female"
                                                        style={{ width: `${item.porcentaje_mujeres}%` }}
                                                    />
                                                </div>
                                                <span className="dashboard-chart__row-value">
                                                    {item.porcentaje_hombres.toFixed(0)}% / {item.porcentaje_mujeres.toFixed(0)}%
                                                </span>
                                            </div>
                                            <span className="dashboard-chart__row-age">
                                                {item.edad_promedio_oyente.toFixed(1)} a
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                    {/* ── Tabla resumen ── */}
                    <div className="dashboard-business__table-wrap">
                        <h3 className="dashboard-chart__title">Tabla resumen por género</h3>
                        <div className="dashboard-business__table-scroll">
                            <table className="dashboard-business__table">
                                <thead>
                                    <tr>
                                        {TABLE_COLS.map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() => handleSort(col.key)}
                                                className={`dashboard-business__th ${sortKey === col.key ? 'dashboard-business__th--active' : ''}`}
                                            >
                                                <span className="dashboard-business__th-inner">
                                                    {col.label}
                                                    {sortKey === col.key ? (
                                                        <SortIcon dir={sortDir} />
                                                    ) : (
                                                        <SortNeutralIcon />
                                                    )}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((item) => (
                                        <tr
                                            key={item.genero}
                                            className={`${item.genero === topGenre && !selectedGenre ? 'dashboard-business__tr--top' : ''} ${rowClass(item.genero)}`}
                                        >
                                            <td>{item.genero}</td>
                                            <td>{item.artistas_encontrados > 0 ? item.artistas_encontrados : '—'}</td>
                                            <td>{item.canciones_encontradas > 0 ? item.canciones_encontradas : '—'}</td>
                                            <td>{item.duracion_promedio_min !== null ? `${item.duracion_promedio_min} min` : '—'}</td>
                                            <td>{item.porcentaje_explicitos !== null ? `${item.porcentaje_explicitos.toFixed(0)}%` : '—'}</td>
                                            <td>{item.edad_promedio_oyente.toFixed(1)}</td>
                                            <td>{item.porcentaje_hombres.toFixed(0)}% / {item.porcentaje_mujeres.toFixed(0)}%</td>
                                            <td>${item.potencial_ganancia_usd.toLocaleString()}</td>
                                            <td>{item.cumplimiento_meta_pct.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Goal meter cards row ── */}
                    <div className="dashboard-business__goals-row">
                        <h3 className="dashboard-chart__title dashboard-business__goals-title">Medidor de Metas</h3>
                        <div className="dashboard-business__goals-cards">
                            {goalData.map((item) => {
                                const pct = Math.min(item.cumplimiento_meta_pct, 100);
                                const trend = item.tendencia_crecimiento_pct;
                                const dotClass =
                                    item.cumplimiento_meta_pct >= 80 ? 'dot--green' :
                                    item.cumplimiento_meta_pct >= 60 ? 'dot--yellow' : 'dot--red';
                                return (
                                    <div key={item.genero} className="dashboard-business__goal-card">
                                        <div className="dashboard-business__goal-card-head">
                                            <span className="dashboard-business__goal-card-genre">{item.genero}</span>
                                            <span className={`dashboard-chart__goal-dot ${dotClass}`} />
                                        </div>
                                        <div className="dashboard-business__goal-card-bar-track">
                                            <div
                                                className="dashboard-business__goal-card-bar-fill"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="dashboard-business__goal-card-pct">{pct.toFixed(0)}%</div>
                                        <div className="dashboard-business__goal-card-values">
                                            <span>${(item.meta_ingresos_usd / 1000).toFixed(0)}K meta</span>
                                            <span>${(item.potencial_ganancia_usd / 1000).toFixed(0)}K act.</span>
                                        </div>
                                        <span
                                            className="dashboard-business__goal-card-trend"
                                            style={{ color: trend >= 0 ? '#22c55e' : '#ef4444' }}
                                        >
                                            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {expandedChart && (
            <ChartOverlay
                chart={expandedChart}
                sortedByRevenue={sortedByRevenue}
                maxRevenue={maxRevenue}
                avgRevenue={avgRevenue}
                data={data}
                rowClass={rowClass}
                vbarClass={vbarClass}
                onClose={() => setExpandedChart(null)}
            />
        )}
            </>
    );
}

type SortKey = 'genero' | 'artistas_encontrados' | 'canciones_encontradas' | 'duracion_promedio_min' | 'porcentaje_explicitos' | 'edad_promedio_oyente' | 'porcentaje_hombres' | 'porcentaje_mujeres' | 'potencial_ganancia_usd' | 'cumplimiento_meta_pct';

const TABLE_COLS: { key: SortKey; label: string }[] = [
    { key: 'genero', label: 'Género' },
    { key: 'artistas_encontrados', label: 'Artistas' },
    { key: 'canciones_encontradas', label: 'Canciones' },
    { key: 'duracion_promedio_min', label: 'Duración prom.' },
    { key: 'porcentaje_explicitos', label: '% Explícito' },
    { key: 'edad_promedio_oyente', label: 'Edad prom.' },
    { key: 'porcentaje_hombres', label: '% H / M' },
    { key: 'potencial_ganancia_usd', label: 'Potencial' },
    { key: 'cumplimiento_meta_pct', label: 'Cumplimiento %' },
];

/* ─── Dashboard Sidebar ──────────────────────── */

interface DashboardSidebarProps {
    data: BusinessMetric[];
    selectedGenre: string | null;
    selectedData: BusinessMetric | null | undefined;
    onSelect: (genre: string | null) => void;
}

function DashboardSidebar({ data, selectedGenre, selectedData, onSelect }: DashboardSidebarProps) {
    return (
        <div className="dashboard-sidebar">
            <button
                className={`dashboard-sidebar__btn ${selectedGenre === null ? 'dashboard-sidebar__btn--active' : ''}`}
                onClick={() => onSelect(null)}
            >
                <span className="dashboard-sidebar__btn-name">Todos</span>
                <span className="dashboard-sidebar__btn-count">{data.length} géneros</span>
            </button>

            <div className="dashboard-sidebar__divider" />

            {data.map((item) => (
                <div key={item.genero} className="dashboard-sidebar__genre-group">
                    <button
                        className={`dashboard-sidebar__btn ${selectedGenre === item.genero ? 'dashboard-sidebar__btn--active' : ''}`}
                        onClick={() => onSelect(item.genero === selectedGenre ? null : item.genero)}
                    >
                        <span className="dashboard-sidebar__btn-name">{item.genero}</span>
                        <span className="dashboard-sidebar__btn-mini">
                            ${(item.potencial_ganancia_usd / 1000).toFixed(0)}K
                        </span>
                    </button>
                    {selectedGenre === item.genero && selectedData && (
                        <GenreSidebarPanel data={selectedData} />
                    )}
                </div>
            ))}
        </div>
    );
}

/* ─── Genre Sidebar Panel ───────────────────── */

interface GenreSidebarPanelProps {
    data: BusinessMetric;
}

function GenreSidebarPanel({ data }: GenreSidebarPanelProps) {
    const pct = Math.min(data.cumplimiento_meta_pct, 100);
    const trend = data.tendencia_crecimiento_pct;
    const dotClass =
        data.cumplimiento_meta_pct >= 80 ? 'dot--green' :
        data.cumplimiento_meta_pct >= 60 ? 'dot--yellow' : 'dot--red';

    const actionMap: Record<string, string> = {
        'Pop': 'Inversión Prioritaria: Redoblar pauta publicitaria y expandir catálogo comercial.',
        'Hip-Hop': 'Crecimiento Agresivo: Invertir en nuevos talentos y optimizar contenido explícito.',
        'Vallenato': 'Expansión Sólida: Incrementar catálogo de conciertos y eventos locales.',
        'Electrónica': 'Campaña Dirigida: Focar esfuerzos en festivales y mercados jóvenes.',
        'Rock': 'Mantenimiento Optimizado: Rotar catálogo antiguo por tendencias actuales.',
        'Clásica': 'Inversión Conservadora: Mantener estabilidad y buscar nichos premium.',
        'Jazz': 'Reestructuración: Analizar causas de caída y pivotar estrategia de mercado.',
    };

    return (
        <div className="dashboard-sidebar__panel">
            <div className="dashboard-sidebar__panel-grid">
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Potencial</span>
                    <span className="dashboard-sidebar__panel-value">${(data.potencial_ganancia_usd / 1000).toFixed(0)}K</span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Meta</span>
                    <span className="dashboard-sidebar__panel-value">${(data.meta_ingresos_usd / 1000).toFixed(0)}K</span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Cumpl.</span>
                    <span className="dashboard-sidebar__panel-value dashboard-sidebar__panel-value--accent">
                        <span className={`dashboard-chart__goal-dot ${dotClass}`} />
                        {pct.toFixed(0)}%
                    </span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Tendencia</span>
                    <span className="dashboard-sidebar__panel-value" style={{ color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">ROI Est.</span>
                    <span className="dashboard-sidebar__panel-value" style={{ color: '#22c55e' }}>
                        {data.roi_estimado_pct?.toFixed(1)}%
                    </span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Inv. Rec.</span>
                    <span className="dashboard-sidebar__panel-value">${(data.inversion_recomendada_usd / 1000).toFixed(0)}K</span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Score</span>
                    <span className="dashboard-sidebar__panel-value">
                        {data.score_inversion}/100
                    </span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Riesgo</span>
                    <span className="dashboard-sidebar__panel-value">
                        <span className={`dashboard-chart__goal-dot ${
                            data.riesgo_inversion === 'Bajo' ? 'dot--green' : 
                            data.riesgo_inversion === 'Medio' ? 'dot--yellow' : 'dot--red'
                        }`} />
                        {data.riesgo_inversion}
                    </span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Edad</span>
                    <span className="dashboard-sidebar__panel-value">{data.edad_promedio_oyente.toFixed(0)} años</span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">H / M</span>
                    <span className="dashboard-sidebar__panel-value">{data.porcentaje_hombres.toFixed(0)}% / {data.porcentaje_mujeres.toFixed(0)}%</span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Artistas</span>
                    <span className="dashboard-sidebar__panel-value">{data.artistas_encontrados}</span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Canciones</span>
                    <span className="dashboard-sidebar__panel-value">{data.canciones_encontradas}</span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Duración</span>
                    <span className="dashboard-sidebar__panel-value">{data.duracion_promedio_min !== null ? `${data.duracion_promedio_min} min` : '—'}</span>
                </div>
                <div className="dashboard-sidebar__panel-metric">
                    <span className="dashboard-sidebar__panel-label">Explícito</span>
                    <span className="dashboard-sidebar__panel-value">{data.porcentaje_explicitos !== null ? `${data.porcentaje_explicitos.toFixed(0)}%` : '0%'}</span>
                </div>
            </div>
            <div className="dashboard-sidebar__panel-recommendation">
                <span className="dashboard-sidebar__panel-recommendation-label">Acción Sugerida:</span>
                <p className="dashboard-sidebar__panel-recommendation-text">
                    {actionMap[data.genero] || 'Análisis de mercado pendiente para este género.'}
                </p>
            </div>
            <div className="dashboard-sidebar__panel-bar-track">
                <div
                    className="dashboard-sidebar__panel-bar-fill"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

/* ─── Chart Overlay ──────────────────────────── */

interface ChartOverlayProps {
    chart: 'potencial' | 'demografia';
    sortedByRevenue: BusinessMetric[];
    maxRevenue: number;
    avgRevenue: number;
    data: BusinessMetric[];
    rowClass: (g: string) => string;
    vbarClass: (g: string) => string;
    onClose: () => void;
}

function ChartOverlay({ chart, sortedByRevenue, maxRevenue, avgRevenue, data, rowClass, vbarClass, onClose }: ChartOverlayProps) {
    return (
        <div className="chart-overlay" onClick={onClose}>
            <div className="chart-overlay__panel" onClick={(e) => e.stopPropagation()}>
                <button className="chart-overlay__close" onClick={onClose}>✕</button>
                <h3 className="chart-overlay__title">
                    {chart === 'potencial' ? 'Potencial de ganancia' : 'Demografía por género'}
                </h3>
                {chart === 'potencial' ? (
                    <>
                        <div className="dashboard-chart__bars-vertical chart-overlay__bars">
                            {sortedByRevenue.map((item) => (
                                <div key={item.genero} className={`dashboard-chart__vbar-group ${vbarClass(item.genero)}`}>
                                    <div className="dashboard-chart__vbar-label">{item.genero}</div>
                                    <div className="dashboard-chart__vbar-track">
                                        <div
                                            className="dashboard-chart__vbar-fill"
                                            style={{ height: `${(item.potencial_ganancia_usd / maxRevenue) * 100}%` }}
                                        />
                                        <div
                                            className="dashboard-chart__vbar-avg-line"
                                            style={{ bottom: `${(avgRevenue / maxRevenue) * 100}%` }}
                                        />
                                    </div>
                                    <span className="dashboard-chart__vbar-value">
                                        ${(item.potencial_ganancia_usd / 1000).toFixed(0)}K
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="dashboard-chart__avg-legend">
                            <span className="dashboard-chart__avg-line-sample" />
                            <span>Prom: ${(avgRevenue / 1000).toFixed(0)}K</span>
                        </div>
                    </>
                ) : (
                    <div className="dashboard-chart__table chart-overlay__table">
                        {data.map((item) => (
                            <div key={item.genero} className={`dashboard-chart__row ${rowClass(item.genero)}`}>
                                <span className="dashboard-chart__row-label">{item.genero}</span>
                                <div className="dashboard-chart__row-bars">
                                    <div className="dashboard-chart__bar-group">
                                        <div
                                            className="dashboard-chart__bar dashboard-chart__bar--male"
                                            style={{ width: `${item.porcentaje_hombres}%` }}
                                        />
                                        <div
                                            className="dashboard-chart__bar dashboard-chart__bar--female"
                                            style={{ width: `${item.porcentaje_mujeres}%` }}
                                        />
                                    </div>
                                    <span className="dashboard-chart__row-value">
                                        {item.porcentaje_hombres.toFixed(0)}% / {item.porcentaje_mujeres.toFixed(0)}%
                                    </span>
                                </div>
                                <span className="dashboard-chart__row-age">
                                    {item.edad_promedio_oyente.toFixed(1)} a
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Icons ─────────────────────────────────── */

function BusinessIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-8 4 4 4-6" />
        </svg>
    );
}

function SortIcon({ dir }: { dir: 'asc' | 'desc' }) {
    return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ opacity: 0.7, flexShrink: 0 }}>
            {dir === 'asc'
                ? <path d="M5 2L8 7H2L5 2Z" />
                : <path d="M5 8L2 3H8L5 8Z" />
            }
        </svg>
    );
}

function SortNeutralIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ opacity: 0.25, flexShrink: 0 }}>
            <path d="M5 1L7.5 4.5H2.5L5 1Z M5 9L2.5 5.5H7.5L5 9Z" />
        </svg>
    );
}
