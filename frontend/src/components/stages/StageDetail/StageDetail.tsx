import { useState, useEffect, useMemo } from 'react';
import type { ClassificationResult, PersonalRecommendation } from '../../../types';
import { GENRE_INFO, type TrackInfo } from '../../../constants';
import { fetchPersonalRecommendations } from '../../../services/dashboard';
import './StageDetail.css';

interface StageDetailProps {
  result:  ClassificationResult;
  onReset: () => void;
}

export function StageDetail({ result, onReset }: StageDetailProps) {
  const { genre }         = result;
  const info              = GENRE_INFO[genre];
  const [activeTrack, setActiveTrack] = useState<TrackInfo | null>(null);

  const [spotifyData, setSpotifyData] = useState<PersonalRecommendation[]>([]);
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPersonalRecommendations(genre)
      .then((data) => {
        if (!cancelled) {
          setSpotifyData(data);
          setSpotifyLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSpotifyError(err instanceof Error ? err.message : 'Error al cargar datos');
          setSpotifyLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [genre]);

  const artists = useMemo(() => {
    const map = new Map<string, PersonalRecommendation[]>();
    for (const item of spotifyData) {
      const existing = map.get(item.artista_nombre);
      if (existing) existing.push(item);
      else map.set(item.artista_nombre, [item]);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [spotifyData]);

  return (
    <section className="stage-detail">
      <div className="stage-detail__content">
        <div className="stage-detail__header">
          <span className="stage-detail__genre-tag">{genre}</span>
          <h2 className="stage-detail__title">Escucha también</h2>
        </div>

        {/* ── YouTube tracks ── */}
        <div className="stage-detail__tracks">
          {info.tracks.map((track) => (
            <button
              key={`${track.artist}-${track.title}`}
              className={`stage-detail__track ${activeTrack?.title === track.title ? 'stage-detail__track--active' : ''}`}
              onClick={() => setActiveTrack(
                activeTrack?.title === track.title ? null : track
              )}
            >
              <div className="stage-detail__track-info">
                <span className="stage-detail__track-title">{track.title}</span>
                <span className="stage-detail__track-artist">{track.artist}</span>
              </div>
              <div className="stage-detail__track-action">
                {activeTrack?.title === track.title ? <PauseIcon /> : <PlayIcon />}
              </div>
            </button>
          ))}
        </div>

        {activeTrack && (
          <div className="stage-detail__player">
            <iframe
              key={activeTrack.videoId}
              src={`https://www.youtube.com/embed/${activeTrack.videoId}?autoplay=1&rel=0`}
              title={`${activeTrack.title} - ${activeTrack.artist}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
            />
          </div>
        )}

        {/* ── Spotify recommendations ── */}
        <div className="stage-detail__spotify-section">
          <h3 className="stage-detail__spotify-title">Recomendaciones en Spotify</h3>

          {spotifyLoading && (
            <div className="stage-detail__spotify-loading">Cargando recomendaciones…</div>
          )}

          {spotifyError && (
            <div className="stage-detail__spotify-error">{spotifyError}</div>
          )}

          {!spotifyLoading && !spotifyError && spotifyData.length === 0 && (
            <div className="stage-detail__spotify-empty">No hay datos disponibles para este género.</div>
          )}

          {!spotifyLoading && !spotifyError && spotifyData.length > 0 && (
            <>
              <div className="stage-detail__spotify-artists">
                {artists.map(([artistName, items]) => {
                  const first = items[0];
                  return (
                    <div key={artistName} className="stage-detail__spotify-artist">
                      <div className="stage-detail__spotify-artist-img">
                        {first.imagen_artista ? (
                          <img src={first.imagen_artista} alt={artistName} loading="lazy" />
                        ) : (
                          <div className="stage-detail__spotify-artist-placeholder">
                            {artistName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="stage-detail__spotify-artist-info">
                        <span className="stage-detail__spotify-artist-name">{artistName}</span>
                        <span className="stage-detail__spotify-artist-songs">
                          {items.length} {items.length === 1 ? 'canción' : 'canciones'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="stage-detail__spotify-songs">
                {spotifyData.map((item) => (
                  <div key={item.cancion_id || item.cancion_nombre} className="stage-detail__spotify-song">
                    <div className="stage-detail__spotify-song-img">
                      {item.imagen_album ? (
                        <img src={item.imagen_album} alt={item.cancion_nombre} loading="lazy" />
                      ) : (
                        <div className="stage-detail__spotify-song-placeholder">♪</div>
                      )}
                    </div>
                    <div className="stage-detail__spotify-song-info">
                      <span className="stage-detail__spotify-song-title">{item.cancion_nombre}</span>
                      <span className="stage-detail__spotify-song-artist">{item.artista_nombre}</span>
                      <span className="stage-detail__spotify-song-pop">
                        {fmt(item.duracion_ms)}
                        {item.es_explicito && <span className="stage-detail__explicit-tag"> E</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <button className="stage-detail__reset" onClick={onReset}>
          ↩ Identificar otro género
        </button>
      </div>
    </section>
  );
}

function fmt(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
