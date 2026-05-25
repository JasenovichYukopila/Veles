import React from 'react';
import './StageMenu.css';

interface StageMenuProps {
  onClassify: () => void;
  onDashboard: () => void;
  onBack: () => void;
}

export const StageMenu: React.FC<StageMenuProps> = ({ onClassify, onDashboard, onBack }) => {
  return (
    <div className="menu-container fade-in">
      {/* Botón de retroceso minimalista superior izquierdo */}
      <button className="back-button" onClick={onBack} aria-label="Volver al inicio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Volver al menú</span>
      </button>

      <div className="menu-split-layout">
        {/* =========================================
            CANAL 1: INFERENCIA (Identificar)
        ========================================= */}
        <div className="menu-channel channel-left" onClick={onClassify} role="button" tabIndex={0}>
          {/* Textura de fondo: Ondas espectrales */}
          <div className="channel-bg-fx">
            <div className="spectral-waves">
              {[...Array(12)].map((_, i) => <div key={`w-${i}`} className={`s-wave w-${i + 1}`} />)}
            </div>
          </div>
          
          <div className="channel-content">
            <div className="channel-header">
              <span className="channel-number">01</span>
            </div>
            <h2 className="channel-title">Inferencia Acústica</h2>
            <p className="channel-desc">
              Activa el pipeline en tiempo real para la captura de audio y extracción de características.
            </p>
            <div className="channel-action">
              <span className="action-text">Iniciar captura</span>
              <div className="action-icon dynamic-mic">
                <span className="recording-dot"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria central */}
        <div className="center-horizon-divider"></div>

        {/* =========================================
            CANAL 2: DASHBOARD (Métricas)
        ========================================= */}
        <div className="menu-channel channel-right" onClick={onDashboard} role="button" tabIndex={0}>
          {/* Textura de fondo: Matriz geométrica */}
          <div className="channel-bg-fx">
            <div className="data-matrix-grid"></div>
          </div>

          <div className="channel-content">
            <div className="channel-header">
              <span className="channel-number">02</span>
            </div>
            <h2 className="channel-title">Inteligencia de Datos</h2>
            <p className="channel-desc">
              Visualización estática de predicciones, performance del modelo y métricas de Spotify.
            </p>
            <div className="channel-action">
              <span className="action-text">Ver métricas</span>
              <div className="action-icon static-chart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};