import './StageMenu.css';

interface StageMenuProps {
    onClassify: () => void;
    onDashboard: () => void;
}

export function StageMenu({ onClassify, onDashboard }: StageMenuProps) {
    return (
        <section className="stage-menu">
            <div className="stage-menu__content">
                <div className="stage-menu__header">
                    <h1 className="stage-menu__title">Veles</h1>
                    <p className="stage-menu__subtitle">
                        Identificación de géneros musicales
                    </p>
                </div>

                <div className="stage-menu__cards">
                    <button className="stage-menu__card stage-menu__card--classify" onClick={onClassify}>
                        <div className="stage-menu__card-icon">
                            <WaveIcon />
                        </div>
                        <span className="stage-menu__card-label">Identificar</span>
                    </button>

                    <button className="stage-menu__card stage-menu__card--dashboard" onClick={onDashboard}>
                        <div className="stage-menu__card-icon">
                            <ChartIcon />
                        </div>
                        <span className="stage-menu__card-label">Dashboard</span>
                    </button>
                </div>
            </div>
        </section>
    );
}

function WaveIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 10v4" />
            <path d="M7 6v12" />
            <path d="M12 3v18" />
            <path d="M17 6v12" />
            <path d="M22 10v4" />
        </svg>
    );
}

function ChartIcon() {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 3v18h18" />
            <path d="M7 16V8" />
            <path d="M11 16V12" />
            <path d="M15 16V6" />
            <path d="M19 16V10" />
        </svg>
    );
}
