import { useEffect, useState, useMemo } from 'react';
import type { Genre, BusinessMetric, PersonalRecommendation } from '../../../types';
import { fetchBusinessMetrics, fetchPersonalRecommendations } from '../../../services/dashboard';
import './StageDashboard.css';

type DashboardView = 'menu' | 'business' | 'personal';

interface StageDashboardProps {
    genre: Genre;
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
                    <BusinessView onBack={() => setView('menu')} />
                )}
                {view === 'personal' && (
                    <PersonalView genre={genre} onBack={() => setView('menu')} />
                )}
            </div>
        </section>
    );
}

/* ─── Menu ─────────────────────────────────── */

interface DashboardMenuProps {
    genre: Genre;
    onSelect: (view: DashboardView) => void;
    onReset: () => void;
}

function DashboardMenu({ genre, onSelect, onReset }: DashboardMenuProps) {
    return (
        <div className="dashboard-menu">
            <span className="dashboard-menu__label">Dashboard</span>
            <h2 className="dashboard-menu__title">Explora los datos</h2>
            <p className="dashboard-menu__subtitle">
                Basado en el género detectado: <strong>{genre}</strong>
            </p>

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

                <button className="dashboard-menu__card" onClick={() => onSelect('personal')}>
                    <div className="dashboard-menu__card-icon">
                        <PersonalIcon />
                    </div>
                    <div className="dashboard-menu__card-body">
                        <h3 className="dashboard-menu__card-title">Personal</h3>
                        <p className="dashboard-menu__card-desc">
                            Artistas y canciones del género <strong>{genre}</strong> extraídos
                            en tiempo real desde Spotify.
                        </p>
                        <span className="dashboard-menu__card-action">Ver dashboard →</span>
                    </div>
                </button>
            </div>

            <button className="dashboard-menu__reset" onClick={onReset}>
                ↩ Identificar otro género
            </button>
        </div>
    );
}

/* ─── Business View ──────────────────────────── */

function fmt(ms: number): string {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

interface BusinessViewProps {
    onBack: () => void;
}

function BusinessView({ onBack }: BusinessViewProps) {
    const [data, setData] = useState<BusinessMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    if (loading) return <DashboardLoading />;
    if (error) return <DashboardError message={error} onRetry={() => window.location.reload()} />;

    // Solo géneros con datos reales del catálogo
    const withData = data.filter((d) => d.artistas_encontrados > 0);
    const sortedByRevenue = [...data].sort((a, b) => b.potencial_ganancia_usd - a.potencial_ganancia_usd);
    const maxRevenue = Math.max(...data.map((d) => d.potencial_ganancia_usd), 1);

    return (
        <div className="dashboard-view">
            <div className="dashboard-view__header">
                <button className="dashboard-view__back" onClick={onBack}>← Volver</button>
                <div>
                    <span className="dashboard-view__label">Dashboard Empresarial</span>
                    <h2 className="dashboard-view__title">Métricas de Mercado</h2>
                    <p className="dashboard-view__desc">
                        KPIs por género para toma de decisiones comerciales
                    </p>
                </div>
            </div>

            {/* ── Cards: catálogo real por género ── */}
            <div className="dashboard-business__cards">
                {withData.map((item) => (
                    <div key={item.genero} className="dashboard-business__card">
                        <div className="dashboard-business__card-genre">{item.genero}</div>
                        <div className="dashboard-business__card-metric">
                            <span className="dashboard-business__card-value">
                                ${(item.potencial_ganancia_usd / 1000).toFixed(0)}K
                            </span>
                            <span className="dashboard-business__card-label">Potencial ganancia</span>
                        </div>
                        <div className="dashboard-business__card-bar">
                            <div
                                className="dashboard-business__card-bar-fill"
                                style={{ width: `${(item.potencial_ganancia_usd / maxRevenue) * 100}%` }}
                            />
                        </div>
                        {item.porcentaje_explicitos !== null && item.porcentaje_explicitos > 0 && (
                            <div className="dashboard-business__explicit-badge">
                                {item.porcentaje_explicitos.toFixed(0)}% explícito
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Medidor de metas ── */}
            <div className="dashboard-business__chart">
                <h3 className="dashboard-chart__title">Medidor de Metas — Ingresos vs Objetivo</h3>
                <div className="dashboard-chart__table">
                    {sortedByRevenue.map((item) => {
                        const pct = Math.min(item.cumplimiento_meta_pct, 100);
                        const trend = item.tendencia_crecimiento_pct;
                        return (
                            <div key={item.genero} className="dashboard-chart__row dashboard-chart__row--goal">
                                <span className="dashboard-chart__row-label">{item.genero}</span>
                                <div className="dashboard-chart__goal-body">
                                    <div className="dashboard-chart__goal-bar-row">
                                        <div className="dashboard-chart__bar-group">
                                            <div
                                                className="dashboard-chart__bar dashboard-chart__bar--male"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="dashboard-chart__goal-pct">{pct.toFixed(0)}%</span>
                                    </div>
                                    <div className="dashboard-chart__goal-labels">
                                        <span>Meta: ${(item.meta_ingresos_usd / 1000).toFixed(0)}K</span>
                                        <span>·</span>
                                        <span>Actual: ${(item.potencial_ganancia_usd / 1000).toFixed(0)}K</span>
                                    </div>
                                </div>
                                <span
                                    className="dashboard-chart__row-age"
                                    style={{ color: trend >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}
                                >
                                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Demografía + barras de potencial ── */}
            <div className="dashboard-business__charts">
                <div className="dashboard-business__chart">
                    <h3 className="dashboard-chart__title">Demografía por género</h3>
                    <div className="dashboard-chart__table">
                        {data.map((item) => (
                            <div key={item.genero} className="dashboard-chart__row">
                                <span className="dashboard-chart__row-label">{item.genero}</span>
                                <div className="dashboard-chart__row-bars">
                                    <div className="dashboard-chart__bar-group">
                                        <div
                                            className="dashboard-chart__bar dashboard-chart__bar--male"
                                            style={{ width: `${item.porcentaje_hombres}%` }}
                                            title={`Hombres: ${item.porcentaje_hombres}%`}
                                        />
                                        <div
                                            className="dashboard-chart__bar dashboard-chart__bar--female"
                                            style={{ width: `${item.porcentaje_mujeres}%` }}
                                            title={`Mujeres: ${item.porcentaje_mujeres}%`}
                                        />
                                    </div>
                                    <span className="dashboard-chart__row-value">
                                        {item.porcentaje_hombres.toFixed(0)}% / {item.porcentaje_mujeres.toFixed(0)}%
                                    </span>
                                </div>
                                <span className="dashboard-chart__row-age">
                                    {item.edad_promedio_oyente.toFixed(1)} años
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-business__chart">
                    <h3 className="dashboard-chart__title">Potencial de ganancia</h3>
                    <div className="dashboard-chart__bars-vertical">
                        {sortedByRevenue.map((item) => (
                            <div key={item.genero} className="dashboard-chart__vbar-group">
                                <div className="dashboard-chart__vbar-label">{item.genero}</div>
                                <div className="dashboard-chart__vbar-track">
                                    <div
                                        className="dashboard-chart__vbar-fill"
                                        style={{ height: `${(item.potencial_ganancia_usd / maxRevenue) * 100}%` }}
                                    />
                                </div>
                                <span className="dashboard-chart__vbar-value">
                                    ${(item.potencial_ganancia_usd / 1000).toFixed(0)}K
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
                                <th>Género</th>
                                <th>Artistas</th>
                                <th>Canciones</th>
                                <th>Duración prom.</th>
                                <th>% Explícito</th>
                                <th>Edad prom.</th>
                                <th>% H / M</th>
                                <th>Potencial</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.genero}>
                                    <td>{item.genero}</td>
                                    <td>{item.artistas_encontrados > 0 ? item.artistas_encontrados : '—'}</td>
                                    <td>{item.canciones_encontradas > 0 ? item.canciones_encontradas : '—'}</td>
                                    <td>{item.duracion_promedio_min !== null ? `${item.duracion_promedio_min} min` : '—'}</td>
                                    <td>{item.porcentaje_explicitos !== null ? `${item.porcentaje_explicitos.toFixed(0)}%` : '—'}</td>
                                    <td>{item.edad_promedio_oyente.toFixed(1)}</td>
                                    <td>{item.porcentaje_hombres.toFixed(0)}% / {item.porcentaje_mujeres.toFixed(0)}%</td>
                                    <td>${item.potencial_ganancia_usd.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ─── Personal View ──────────────────────────── */

interface PersonalViewProps {
    genre: Genre;
    onBack: () => void;
}

function PersonalView({ genre, onBack }: PersonalViewProps) {
    const [data, setData] = useState<PersonalRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetchPersonalRecommendations(genre)
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
    }, [genre]);

    const artists = useMemo(() => {
        const map = new Map<string, PersonalRecommendation[]>();
        for (const item of data) {
            const existing = map.get(item.artista_nombre);
            if (existing) existing.push(item);
            else map.set(item.artista_nombre, [item]);
        }
        // Orden: artistas con más canciones primero
        return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
    }, [data]);

    if (loading) return <DashboardLoading />;
    if (error) return <DashboardError message={error} onRetry={() => window.location.reload()} />;

    if (data.length === 0) {
        return (
            <div className="dashboard-view">
                <div className="dashboard-view__header">
                    <button className="dashboard-view__back" onClick={onBack}>← Volver</button>
                    <div>
                        <span className="dashboard-view__label">Dashboard Personal</span>
                        <h2 className="dashboard-view__title">{genre}</h2>
                        <p className="dashboard-view__desc">No hay datos disponibles para este género.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-view">
            <div className="dashboard-view__header">
                <button className="dashboard-view__back" onClick={onBack}>← Volver</button>
                <div>
                    <span className="dashboard-view__label">Dashboard Personal</span>
                    <h2 className="dashboard-view__title">{genre}</h2>
                    <p className="dashboard-view__desc">
                        {artists.length} artistas · {data.length} canciones
                    </p>
                </div>
            </div>

            <div className="dashboard-personal__artists-strip">
                {artists.map(([artistName, items]) => {
                    const first = items[0];
                    return (
                        <div key={artistName} className="dashboard-personal__artist-chip">
                            <div className="dashboard-personal__artist-chip-img">
                                {first.imagen_artista ? (
                                    <img src={first.imagen_artista} alt={artistName} loading="lazy" />
                                ) : (
                                    <div className="dashboard-personal__artist-chip-placeholder">
                                        {artistName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="dashboard-personal__artist-chip-info">
                                <span className="dashboard-personal__artist-chip-name">{artistName}</span>
                                <span className="dashboard-personal__artist-chip-followers">
                                    {items.length} {items.length === 1 ? 'canción' : 'canciones'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-personal__songs-grid">
                {data.map((item) => (
                    <div key={item.cancion_id || item.cancion_nombre} className="dashboard-personal__song-card">
                        <div className="dashboard-personal__song-card-img">
                            {item.imagen_album ? (
                                <img src={item.imagen_album} alt={item.cancion_nombre} loading="lazy" />
                            ) : (
                                <div className="dashboard-personal__song-card-placeholder">♪</div>
                            )}
                        </div>
                        <div className="dashboard-personal__song-card-info">
                            <span className="dashboard-personal__song-card-title">{item.cancion_nombre}</span>
                            <span className="dashboard-personal__song-card-artist">{item.artista_nombre}</span>
                            <span className="dashboard-personal__song-card-pop">
                                {fmt(item.duracion_ms)}
                                {item.es_explicito && <span className="dashboard-personal__explicit-tag"> E</span>}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Shared ────────────────────────────────── */

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

/* ─── Icons ─────────────────────────────────── */

function BusinessIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-8 4 4 4-6" />
        </svg>
    );
}

function PersonalIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    );
}
