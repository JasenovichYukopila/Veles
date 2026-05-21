import { useState } from 'react';
import type { ClassificationResult } from '../../../types';
import { GENRE_INFO, type TrackInfo } from '../../../constants';
import './StageDetail.css';

interface StageDetailProps {
  result:  ClassificationResult;
  onReset: () => void;
}

export function StageDetail({ result, onReset }: StageDetailProps) {
  const { genre }         = result;
  const info              = GENRE_INFO[genre];
  const [activeTrack, setActiveTrack] = useState<TrackInfo | null>(null);

  return (
    <section className="stage-detail">
      <div className="stage-detail__content">
        <div className="stage-detail__header">
          <span className="stage-detail__genre-tag">{genre}</span>
          <h2 className="stage-detail__title">Escucha también</h2>
        </div>

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

        <button className="stage-detail__reset" onClick={onReset}>
          ↩ Identificar otro género
        </button>
      </div>
    </section>
  );
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