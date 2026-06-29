import { useMemo, useState } from 'react';

type TeamSide = 'home' | 'away';

type PrototypePiece = {
  id: string;
  side: TeamSide;
  role: 'GK' | 'DF' | 'MF' | 'FW';
  name: string;
  asset: string;
  x: number;
  y: number;
};

const pieces: PrototypePiece[] = [
  { id: 'home-gk', side: 'home', role: 'GK', name: 'Keeper', asset: '/assets/pieces/ally_gk_cost2.png', x: 1, y: 3 },
  { id: 'home-df', side: 'home', role: 'DF', name: 'Back', asset: '/assets/pieces/ally_df_cost2.png', x: 3, y: 2 },
  { id: 'home-mf', side: 'home', role: 'MF', name: 'Playmaker', asset: '/assets/pieces/ally_om_cost2plus.png', x: 5, y: 4 },
  { id: 'home-fw', side: 'home', role: 'FW', name: 'Striker', asset: '/assets/pieces/ally_fw_ss.png', x: 7, y: 3 },
  { id: 'away-gk', side: 'away', role: 'GK', name: 'Keeper', asset: '/assets/pieces/enemy_gk_cost2.png', x: 11, y: 3 },
  { id: 'away-df', side: 'away', role: 'DF', name: 'Back', asset: '/assets/pieces/enemy_df_cost2.png', x: 9, y: 2 },
  { id: 'away-mf', side: 'away', role: 'MF', name: 'Anchor', asset: '/assets/pieces/enemy_vo_cost2plus.png', x: 7, y: 5 },
  { id: 'away-fw', side: 'away', role: 'FW', name: 'Forward', asset: '/assets/pieces/enemy_fw_cost2plus.png', x: 5, y: 1 },
];

const actionLabels = [
  { key: 'dribble', label: 'DRIBBLE' },
  { key: 'pass', label: 'PASS' },
  { key: 'space', label: 'SPACE' },
  { key: 'cancel', label: 'CANCEL' },
] as const;

export function App() {
  const [selectedId, setSelectedId] = useState('home-mf');
  const selectedPiece = useMemo(() => pieces.find((piece) => piece.id === selectedId), [selectedId]);

  return (
    <main className="app-shell">
      <header className="match-header">
        <div>
          <p className="kicker">Football Chess Next</p>
          <h1>Unity Web Port Prototype</h1>
        </div>
        <div className="scoreboard" aria-label="score">
          <span>HOME</span>
          <strong>0 - 0</strong>
          <span>AWAY</span>
        </div>
      </header>

      <section className="pitch-wrap" aria-label="prototype board">
        <div className="pitch">
          <div className="center-line" />
          <div className="center-circle" />
          <div className="goal goal-left" />
          <div className="goal goal-right" />

          {pieces.map((piece) => {
            const isSelected = piece.id === selectedId;
            return (
              <button
                key={piece.id}
                type="button"
                className={`piece piece-${piece.side} ${isSelected ? 'piece-selected' : ''}`}
                style={{ '--x': piece.x, '--y': piece.y } as React.CSSProperties}
                onClick={() => setSelectedId(piece.id)}
                aria-pressed={isSelected}
                aria-label={`${piece.side} ${piece.role} ${piece.name}`}
              >
                <img src={piece.asset} alt="" draggable={false} />
                <span>{piece.role}</span>
              </button>
            );
          })}

          {selectedPiece ? (
            <div
              className="radial-actions"
              style={{ '--x': selectedPiece.x, '--y': selectedPiece.y } as React.CSSProperties}
              aria-label="piece actions"
            >
              {actionLabels.map((action, index) => (
                <button
                  key={action.key}
                  type="button"
                  className={`action action-${index}`}
                  onClick={() => {
                    if (action.key === 'cancel') {
                      setSelectedId('');
                    }
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="bench">
        <div className="bench-card is-active">
          <span>Selected</span>
          <strong>{selectedPiece ? `${selectedPiece.role} / ${selectedPiece.name}` : 'None'}</strong>
        </div>
        <div className="bench-card">
          <span>Server</span>
          <strong>Cloudflare</strong>
        </div>
        <div className="bench-card">
          <span>Model</span>
          <strong>No Ads / Subscription</strong>
        </div>
      </footer>
    </main>
  );
}

