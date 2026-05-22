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
                            Métricas comerciales agregadas por género musical: popularidad,
                            seguidores, demografía de audiencia y potencial de ganancia.
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
                            Artistas y canciones recomendadas del género <strong>{genre}</strong>,
                            con datos de popularidad y seguidores.
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
                if (!cancelled) {
                    setData(result);
                    setLoading(false);
                }
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

    const sortedByRevenue = [...data].sort((a, b) => b.potencial_ganancia_usd - a.potencial_ganancia_usd);
    const maxRevenue = Math.max(...data.map((d) => d.potencial_ganancia_usd));

    return (
        <div className="dashboard-view">
            <div className="dashboard-view__header">
                <button className="dashboard-view__back" onClick={onBack}>← Volver</button>
                <div>
                    <span className="dashboard-view__label">Dashboard Empresarial</span>
                    <h2 className="dashboard-view__title">Métricas de Mercado</h2>
                    <p className="dashboard-view__desc">
                        Comparativa de indicadores comerciales por género musical
                    </p>
                </div>
            </div>

            <div className="dashboard-business__cards">
                {sortedByRevenue.map((item) => (
                    <div key={item.genero} className="dashboard-business__card">
                        <div className="dashboard-business__card-genre">{item.genero}</div>
                        <div className="dashboard-business__card-metric">
                            <span className="dashboard-business__card-value">
                                ${(item.potencial_ganancia_usd / 1000).toFixed(0)}K
                            </span>
                            <span className="dashboard-business__card-label">Ganancia potencial</span>
                        </div>
                        <div className="dashboard-business__card-bar">
                            <div
                                className="dashboard-business__card-bar-fill"
                                style={{ width: `${(item.potencial_ganancia_usd / maxRevenue) * 100}%` }}
                            />
                        </div>
                        <div className="dashboard-business__card-stats">
                            <div>
                                <span className="dashboard-business__stat-value">{(item.popularidad_promedio).toFixed(0)}</span>
                                <span className="dashboard-business__stat-label">Popularidad</span>
                            </div>
                            <div>
                                <span className="dashboard-business__stat-value">{item.seguidores_totales.toLocaleString()}</span>
                                <span className="dashboard-business__stat-label">Seguidores</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
                    <h3 className="dashboard-chart__title">Ingreso potencial por género</h3>
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

            <div className="dashboard-business__table-wrap">
                <h3 className="dashboard-chart__title">Tabla completa</h3>
                <div className="dashboard-business__table-scroll">
                    <table className="dashboard-business__table">
                        <thead>
                            <tr>
                                <th>Género</th>
                                <th>Popularidad</th>
                                <th>Seguidores</th>
                                <th>Edad prom.</th>
                                <th>% Hombres</th>
                                <th>% Mujeres</th>
                                <th>Ganancia USD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.genero}>
                                    <td>{item.genero}</td>
                                    <td>{item.popularidad_promedio.toFixed(1)}</td>
                                    <td>{item.seguidores_totales.toLocaleString()}</td>
                                    <td>{item.edad_promedio_oyente.toFixed(1)}</td>
                                    <td>{item.porcentaje_hombres.toFixed(1)}%</td>
                                    <td>{item.porcentaje_mujeres.toFixed(1)}%</td>
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
                if (!cancelled) {
                    setData(result);
                    setLoading(false);
                }
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
            if (existing) {
                existing.push(item);
            } else {
                map.set(item.artista_nombre, [item]);
            }
        }
        return Array.from(map.entries()).sort(
            (a, b) => b[1][0].seguidores_artista - a[1][0].seguidores_artista
        );
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
                                    {first.seguidores_artista.toLocaleString()} seguidores
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
                            <span className="dashboard-personal__song-card-pop">★ {item.popularidad_cancion}</span>
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
