import { useMemo, useState } from 'react';

type TeamSide = 'blue' | 'red';
type PieceRole = 'FW' | 'MF' | 'DF' | 'GK';

type CellPosition = {
  x: number;
  y: number;
};

type DefaultPiece = {
  id: number;
  position: CellPosition;
};

type PieceMaster = {
  role: PieceRole;
  cost: 1 | 1.5 | 2 | 2.5 | 3;
};

type BoardPiece = DefaultPiece &
  PieceMaster & {
    guid: string;
    side: TeamSide;
  };

const texture = '/unity/Static/Texture';

const pieceMasters: Record<number, PieceMaster> = {
  1: { role: 'FW', cost: 1 },
  2: { role: 'FW', cost: 1.5 },
  3: { role: 'FW', cost: 2 },
  4: { role: 'FW', cost: 2.5 },
  5: { role: 'FW', cost: 3 },
  6: { role: 'MF', cost: 1 },
  7: { role: 'MF', cost: 1.5 },
  8: { role: 'MF', cost: 2 },
  9: { role: 'MF', cost: 2.5 },
  10: { role: 'MF', cost: 3 },
  11: { role: 'DF', cost: 1 },
  12: { role: 'DF', cost: 1.5 },
  13: { role: 'DF', cost: 2 },
  14: { role: 'DF', cost: 2.5 },
  15: { role: 'DF', cost: 3 },
  16: { role: 'GK', cost: 1 },
  17: { role: 'GK', cost: 1.5 },
  18: { role: 'GK', cost: 2 },
  19: { role: 'GK', cost: 2.5 },
  20: { role: 'GK', cost: 3 },
};

const defaultTeam: DefaultPiece[] = [
  { id: 5, position: { x: -1, y: 0 } },
  { id: 1, position: { x: 1, y: 0 } },
  { id: 6, position: { x: -2, y: -1 } },
  { id: 8, position: { x: -1, y: -1 } },
  { id: 6, position: { x: 1, y: -1 } },
  { id: 10, position: { x: 2, y: -1 } },
  { id: 12, position: { x: -2, y: -2 } },
  { id: 13, position: { x: -1, y: -2 } },
  { id: 18, position: { x: 0, y: -2 } },
  { id: 11, position: { x: 1, y: -2 } },
  { id: 11, position: { x: 2, y: -2 } },
];

const costImageName: Record<PieceMaster['cost'], string> = {
  1: 'cost10',
  1.5: 'cost15',
  2: 'cost20',
  2.5: 'cost25',
  3: 'cost30',
};

const boardPieces: BoardPiece[] = [
  ...defaultTeam.map((piece, index) => ({
    ...piece,
    ...pieceMasters[piece.id],
    guid: `red-${index}`,
    side: 'red' as const,
  })),
  ...defaultTeam.map((piece, index) => ({
    ...piece,
    ...pieceMasters[piece.id],
    guid: `blue-${index}`,
    side: 'blue' as const,
    position: flipCell(piece.position),
  })),
];

function flipCell(position: CellPosition): CellPosition {
  return {
    x: -position.x,
    y: -position.y + 1,
  };
}

function cellToPercent(position: CellPosition): { left: number; top: number } {
  const fieldLeft = 4.5;
  const fieldTop = 5.5;
  const cellWidth = 91 / 5;
  const cellHeight = 86.6 / 6;

  return {
    left: fieldLeft + (position.x + 2.5) * cellWidth,
    top: fieldTop + (position.y + 2.5) * cellHeight,
  };
}

function pieceImage(role: PieceRole, side: TeamSide) {
  const suffix = side === 'blue' ? 'b' : 'r';
  return `${texture}/002_InGame/Piece/${role.toLowerCase()}_${suffix}.png`;
}

function costImage(cost: PieceMaster['cost']) {
  return `${texture}/002_InGame/Cost/${costImageName[cost]}.png`;
}

export function App() {
  const [screen, setScreen] = useState<'title' | 'battle'>('title');
  const [selectedGuid, setSelectedGuid] = useState('blue-0');
  const selectedPiece = useMemo(
    () => boardPieces.find((piece) => piece.guid === selectedGuid),
    [selectedGuid],
  );

  if (screen === 'title') {
    return (
      <main className="title-screen" onClick={() => setScreen('battle')}>
        <img
          className="title-bg"
          src={`${texture}/000_Title/title_op_bg.jpg`}
          alt="Football Chess title"
          draggable={false}
        />
        <img
          className="title-logo"
          src={`${texture}/000_Title/title_logo_gade.png`}
          alt="Gade"
          draggable={false}
        />
        <button className="title-start" type="button" onClick={() => setScreen('battle')}>
          <img src={`${texture}/000_Title/title_tap_bar.png`} alt="" draggable={false} />
          <span>START</span>
        </button>
      </main>
    );
  }

  return (
    <main className="unity-battle">
      <section className="battle-phone" aria-label="Football Chess battle">
        <div className="hud-top">
          <img src={`${texture}/002_InGame/Hud/score_bg.png`} alt="" draggable={false} />
          <span className="score-text">0 - 0</span>
        </div>

        <div className="field">
          <img className="field-bg" src={`${texture}/002_InGame/field.png`} alt="" draggable={false} />
          <img className="kickoff-cutin" src={`${texture}/002_InGame/cutin/kickoff.png`} alt="Kickoff" />

          {boardPieces.map((piece) => {
            const position = cellToPercent(piece.position);
            const isSelected = selectedGuid === piece.guid;

            return (
              <button
                key={piece.guid}
                type="button"
                className={`unity-piece ${piece.side} ${isSelected ? 'is-selected' : ''}`}
                style={
                  {
                    '--left': `${position.left}%`,
                    '--top': `${position.top}%`,
                    '--z': 100 + piece.position.y,
                  } as React.CSSProperties
                }
                onClick={() => setSelectedGuid(piece.guid)}
                aria-label={`${piece.side} ${piece.role} ${piece.cost}`}
              >
                {isSelected ? (
                  <img
                    className="piece-active"
                    src={`${texture}/002_InGame/Piece/piece_active.png`}
                    alt=""
                    draggable={false}
                  />
                ) : null}
                <img className="piece-main" src={pieceImage(piece.role, piece.side)} alt="" draggable={false} />
                <img className="piece-cost" src={costImage(piece.cost)} alt="" draggable={false} />
                {piece.guid === 'blue-0' ? (
                  <img
                    className="piece-ball-mark"
                    src={`${texture}/002_InGame/Piece/have_ball.png`}
                    alt=""
                    draggable={false}
                  />
                ) : null}
              </button>
            );
          })}

          {selectedPiece ? <CommandPanel selectedPiece={selectedPiece} /> : null}
        </div>

        <div className="bottom-hud">
          <img className="bottom-ui" src={`${texture}/002_InGame/bottom_ui.png`} alt="" draggable={false} />
          <button type="button" className="hud-button shoot">
            <img src={`${texture}/002_InGame/Hud/shoot_btn.png`} alt="Shoot" draggable={false} />
          </button>
          <button type="button" className="hud-button turn-end">
            <img src={`${texture}/002_InGame/Hud/turn_end_btn.png`} alt="Turn end" draggable={false} />
          </button>
        </div>
      </section>
    </main>
  );
}

function CommandPanel({ selectedPiece }: { selectedPiece: BoardPiece }) {
  const position = cellToPercent(selectedPiece.position);

  return (
    <div
      className="command-panel"
      style={
        {
          '--left': `${position.left}%`,
          '--top': `${position.top}%`,
        } as React.CSSProperties
      }
    >
      <button type="button">KICK</button>
      <button type="button">MOVE</button>
      <button type="button">CANCEL</button>
    </div>
  );
}
