import React from 'react';
import './StageLanding.css';

interface StageLandingProps {
  onContinue: () => void;
}

const StageLanding: React.FC<StageLandingProps> = ({ onContinue }) => {
  return (
    <div className="landing-container">
      <div className="landing-noise" aria-hidden="true" />

      {/* El Pentagrama Fluido con Partículas de Datos */}
      <div className="musical-staff" aria-hidden="true">
        <div className="staff-string string-1"><div className="data-particle dp-1" /></div>
        <div className="staff-string string-2"><div className="data-particle dp-2" /></div>
        <div className="staff-string string-3"><div className="data-particle dp-3" /></div>
        <div className="staff-string string-4"><div className="data-particle dp-4" /></div>
        <div className="staff-string string-5"><div className="data-particle dp-5" /></div>
      </div>

      <div className="landing-content">
        <div className="hero-typography">
          <div className="hero-meta">
            <span className="meta-dot" />
            <span className="meta-text">MOTOR DE CLASIFICACIÓN MUSICAL</span>
          </div>
          
          <h1 className="hero-title">Veles</h1>
          
          <p className="hero-subtitle">
            Decodificando el ADN de cada frecuencia mediante Machine Learning.
          </p>
        </div>

        <div className="hero-action">
          <button className="nav-button" onClick={onContinue} aria-label="Iniciar análisis">
            <span className="nav-button-text">Iniciar</span>
            <div className="nav-action-circle">
              <svg className="nav-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <div className="landing-footer">
        <div className="scroll-indicator">
          <div className="scroll-line" />
          <span>Desliza para continuar</span>
        </div>
      </div>
    </div>
  );
};

export default StageLanding;