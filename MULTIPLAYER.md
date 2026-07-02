# Multiplayer Plan

Football Chess will live under the UniversoFutbol content umbrella. The online version should keep the current Unity-faithful presentation while moving match authority to Cloudflare.

## Target Shape

- Content path: `/universofutbol/football-chess`
- Worker API prefix: `/api/universofutbol/football-chess`
- One Durable Object `MatchRoom` per match room code
- WebSocket Hibernation for player/spectator connections
- Durable Object SQLite storage for room state and event history
- Browser client remains responsible for animation playback
- Server becomes responsible for authoritative turn state, random rolls, and validation

## Current Increment

The backend increment currently includes:

- `POST /api/universofutbol/football-chess/matches`
  - Creates a room code and returns a join URL.
- `GET /api/universofutbol/football-chess/matches/:roomCode`
  - Returns the persisted room snapshot.
- `GET /api/universofutbol/football-chess/matches/:roomCode/socket`
  - Upgrades to WebSocket and assigns the client to blue, red, or spectator.
- `match.intent`
  - Validates and stores a player's submitted command list for the current turn.
  - When both blue and red have submitted, the Durable Object resolves the turn and broadcasts `match.turn.resolved`.
- `src/game-core.ts`
  - Extracts the first pure rule core from the HTML prototype: board cells, default teams, ball state, probability helpers, seeded RNG, command validation, and the first server-side turn resolver.

This is still intentionally incremental. The current HTML remains playable and can now create/join local Cloudflare rooms, submit player commands over WebSocket, and sync to server-resolved snapshots.

## Implemented Browser Wiring

`football-chess-prototype.html` now includes a compact online bar:

- `ROOM作成`
  - Calls `POST /matches`, connects as blue, and displays the room code.
- `参加`
  - Connects to the entered room code and accepts blue, red, or spectator assignment.
- `URL`
  - Copies a `?room=...` share URL. Opening a URL with that parameter auto-joins the room.
- Reconnect
  - The browser persists a local client id, so reloads can reclaim the same blue/red seat.
  - Disconnected seats can be reclaimed, and presence updates show opponent/pending status.
- Online `TURN END`
  - Sends the local command queue as `match.intent`.
  - Waits for the opponent instead of running the local AI flow.
  - The first submitted intent starts a 3-minute input deadline. If the other side does not submit, the Durable Object resolves the turn with empty commands for the missing side.
- `match.turn.resolved`
  - Replays representative `TurnEvent` cut-ins/ball flights, then applies the authoritative server snapshot.
  - Shot goal/block/miss/save events now replay Unity-like shot trails and cut-ins before snapshot sync.
  - Pass-cut events now include the pass origin and replay the ball flight into the cut point, plus any defensive clear movement.
  - Foul events now show the follow-up PK/FK cut-in in the online replay.
  - Set-piece shot save/goal events now carry `kickLogs`, allowing CK cut-ins to replay from the server-authoritative CK/GK sequence.
- Server match clock
  - Advances 15-turn halves, seeded additional time, halftime re-kickoff, and full-time status on the Durable Object.
  - Browser snapshots now receive `turn.additionalTurns` and render online AT/halftime/full-time events.

## Implemented Server Turn Resolution

The Durable Object now resolves the first authoritative subset when both players submit commands:

- Unity-style command ordering: landing receiver moves, non-move ball actions, then remaining moves.
- Move and dribble resolution.
- Normal pass and throughpass route/landing rolls.
- Loose-ball pickup after resolution.
- Offside checks for completed passes and same-team loose-ball recovery.
- Tackle, foul, PK/FK, CK/GK fallback, and battle-delay/passive-tactics checks.
  - Battle-delay now follows the Unity condition: it only counts when the team that held the ball at turn start still holds it at turn end in its own field.
- Shoot route block checks, PA/VA shot rolls, Unity-style shoot-failure CK/GK retry flow, score updates, and kickoff reset for the conceding team.
- Match clock advancement: first/second half, additional time, halftime kickoff, and full-time lockout.

## Remaining Multiplayer Work

- Compare the new server resolver against more Unity source edge cases and the current HTML implementation, especially simultaneous edge cases around passive tactics, PK/FK CK loops, and shot-block ordering.
- Expand browser replay so every server `TurnEvent` maps to the exact Unity-like animation sequence.
- Add rematch, explicit resign/leave, stronger spectator polish, and production-ready room lifecycle cleanup.
- Add production deployment details for the UniversoFutbol route and subscription/member gating.
