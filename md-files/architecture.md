# Architecture — Image Puzzle Game (GameEngine G7)

> Derived strictly from GameEngine PRD v1.0

---

## 1. System Overview

GameEngine is a **standalone, pluggable npm package**. It is dropped into any web application as a single React component. There is zero backend coupling — the plugin calls the Claude API directly from the browser using the host application's API key.

```
┌──────────────────────────────────────────────────────┐
│  Host Web Application                                 │
│                                                       │
│   <GameEngine                                         │
│     apiKey="..."                                      │
│     games={["image-puzzle"]}                          │
│     onGameComplete={handler}                          │
│   />                                                  │
└───────────────────┬──────────────────────────────────┘
                    │  React component boundary
┌───────────────────▼──────────────────────────────────┐
│  GameEngine Plugin (npm package)                      │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Upload UI  │  │   Launcher   │  │  Game Shell │ │
│  │  Component  │  │   Component  │  │  Component  │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                │                  │        │
│  ┌──────▼──────────────────────────────────▼──────┐  │
│  │              Session State (in-memory)          │  │
│  └──────────────────────┬──────────────────────────┘  │
│                         │                             │
│  ┌──────────────────────▼──────────────────────────┐  │
│  │           Service Layer (headless)               │  │
│  │  ResourceService │ GenerationService │ ScoreService│
│  └──────────────────────┬──────────────────────────┘  │
└───────────────────────────────────────────────────────┘
                          │  HTTPS (browser → Anthropic)
              ┌───────────▼───────────┐
              │   Claude API           │
              │ (Anthropic)            │
              └────────────────────────┘
```

> **Note:** The Image Puzzle (G7) does **not** call the Claude API. It operates on the uploaded image directly. The Claude API is used by text-based games (G1–G6) for content generation.

---

## 2. Package Structure

```
game-engine/
├── src/
│   ├── index.tsx                  # Public entry: exports <GameEngine />
│   ├── components/
│   │   ├── GameEngine.tsx         # Root component, accepts all props
│   │   ├── UploadUI/              # Drag-and-drop upload screen
│   │   ├── Launcher/              # Game card grid, filter bar
│   │   └── GameShell/             # Fullscreen game wrapper, score/pause bar
│   ├── games/
│   │   ├── image-puzzle/          # G7 — lazy-loaded via dynamic import()
│   │   │   ├── ImagePuzzle.tsx    # Main game component
│   │   │   ├── PuzzleBoard.tsx    # Tile grid renderer
│   │   │   ├── Tile.tsx           # Individual tile (drag target)
│   │   │   ├── GhostPreview.tsx   # 25% opacity overlay
│   │   │   └── usePuzzleState.ts  # Game state hook
│   │   ├── impostor/              # G1
│   │   ├── spiral/                # G2
│   │   ├── speed-sniper/          # G3
│   │   ├── black-box/             # G4
│   │   ├── hangman/               # G5
│   │   └── crossword/             # G6
│   ├── services/
│   │   ├── ResourceService.ts     # File validation, image loading
│   │   ├── GenerationService.ts   # Claude API calls (not used by G7)
│   │   └── ScoreService.ts        # Score calculation logic
│   ├── state/
│   │   └── SessionStore.ts        # In-memory session state (no localStorage)
│   ├── types/
│   │   └── index.ts               # All public TypeScript types
│   └── theme/
│       └── ThemeProvider.tsx      # CSS variable injection from ThemeConfig
├── package.json
└── vite.config.ts                 # Library build, dynamic imports per game
```

---

## 3. Image Puzzle Component Architecture

```
<ImagePuzzle />                         ← lazy-loaded game entry
│
├── <PuzzleSetup />                     ← difficulty selection, "Start Game"
│    └── renders uploaded image preview
│
└── <ActivePuzzle />                    ← mounts after "Start Game"
     │
     ├── <PuzzleBoard />                ← N×N grid container (CSS Grid)
     │    └── <Tile /> × N²            ← each tile: absolutely-positioned div
     │         ├── background-image    ← source image
     │         ├── background-position ← correct region offset
     │         ├── drag handlers       ← mousedown/move/up, touch equivalents
     │         ├── green border lock   ← on correct placement (600ms → locked)
     │         └── edge glow on hover  ← for outer-edge tiles
     │
     ├── <GhostPreview />               ← original image at 25% opacity (toggle)
     │
     ├── <GameShell />                  ← score display, pause/exit, progress bar
     │
     └── usePuzzleState (hook)
          ├── tile positions map        ← current slot of each tile
          ├── move counter
          ├── hint usage counter
          ├── timer
          └── completion detector       ← fires when all tiles locked
```

---

## 4. State Management

All state is **in-memory only** — no `localStorage`, no `sessionStorage`, no backend.

### Session State (engine-wide)

| Key | Type | Description |
|-----|------|-------------|
| `uploadedResource` | `ResourceInput` | Validated image file object |
| `gameData` | `Record<GameId, GeneratedContent>` | Cached AI content per game (N/A for G7) |
| `gameResults` | `Record<GameId, SessionResult>` | Last result per game (shown as badge) |
| `activeGame` | `GameId \| null` | Currently running game |

### Image Puzzle State (local to component)

| Key | Type | Description |
|-----|------|-------------|
| `difficulty` | `"easy" \| "medium" \| "hard"` | Grid size selection |
| `gridSize` | `3 \| 4 \| 5` | Derived from difficulty |
| `tiles` | `Tile[]` | Array of tile objects with current and correct slot indices |
| `moveCount` | `number` | Total drag operations completed |
| `hintUses` | `number` | Number of hint activations |
| `ghostVisible` | `boolean` | Ghost preview toggle state |
| `numberHintsVisible` | `boolean` | Number hint toggle state |
| `startTime` | `number` | `Date.now()` at game start |
| `isComplete` | `boolean` | True when all tiles are locked in correct positions |

---

## 5. Resource Ingestion Pipeline (Image Path)

```
User selects / drops image file
         │
         ▼
ResourceService.validate(file)
  - Type check: JPG / PNG / WEBP only
  - Size check: ≤ 8 MB
  - Format sniff: read magic bytes
         │
    FAIL ├──────────────────→ Show error + retry
    PASS │
         ▼
ResourceService.loadImage(file)
  - FileReader → data URL
  - Store in SessionStore.uploadedResource
         │
         ▼
Image displayed at full width in plugin container
         │
         ▼
Image Puzzle card in Launcher → "Ready" state immediately
(no AI generation needed)
```

---

## 6. Tile Slicing Algorithm

```
Given: image (data URL), gridSize N

tileWidth  = image.naturalWidth  / N
tileHeight = image.naturalHeight / N

For each tile index i (0 … N²-1):
  col = i % N
  row = Math.floor(i / N)

  tile.style = {
    width:               tileWidth  + "px",
    height:              tileHeight + "px",
    backgroundImage:     `url(${imageDataUrl})`,
    backgroundSize:      `${image.naturalWidth}px ${image.naturalHeight}px`,
    backgroundPosition:  `${-col * tileWidth}px ${-row * tileHeight}px`,
  }
```

---

## 7. Drag-and-Drop Mechanism

```
mousedown / touchstart
  → capture tile identity + pointer offset
  → set dragging = true

mousemove / touchmove
  → update tile's absolute CSS position (transform: translate)
  → identify nearest slot within 40px

mouseup / touchend
  → find nearest valid slot
  → if within 40px:
      if slot empty:   place tile → check correct position
      if slot occupied: swap tiles → check both positions
  → if outside 40px: return tile to previous position
  → increment moveCount
  → check isComplete
```

---

## 8. Scoring Logic

```typescript
// ScoreService.calculateImagePuzzleScore()

const DIFFICULTY_MULTIPLIER = { easy: 1, medium: 2, hard: 3 };
const BASE_SCORE = 1000;
const MOVE_PENALTY = 10;
const HINT_PENALTY = 100;
const MIN_SCORE = 50;

function calculate(moves: number, hints: number, difficulty: Difficulty): number {
  const raw = (BASE_SCORE - moves * MOVE_PENALTY) * DIFFICULTY_MULTIPLIER[difficulty] - hints * HINT_PENALTY;
  return Math.max(raw, MIN_SCORE);
}
```

---

## 9. Build & Bundle Strategy

| Concern | Approach |
|---------|----------|
| Initial bundle target | < 120 KB gzipped |
| Per-game code splitting | Dynamic `import()` — each game only loaded when launched |
| Build tool | Vite with `--report` for bundle size verification |
| TypeScript | Strict mode; zero implicit `any`; 100% typed public API |
| CSS | CSS variables injected by `ThemeProvider` for host theming |