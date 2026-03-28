# Schema — Image Puzzle Game (GameEngine G7)

> Derived strictly from GameEngine PRD v1.0  
> All data structures, enumerations, and field definitions for the Image Puzzle game.

---

## 1. Enumerations

### GameId

```typescript
type GameId =
  | "impostor"        // G1
  | "spiral"          // G2
  | "speed-sniper"    // G3
  | "black-box"       // G4
  | "hangman"         // G5
  | "crossword"       // G6
  | "image-puzzle";   // G7 ← this game
```

### Difficulty

```typescript
type Difficulty = "easy" | "medium" | "hard";
```

| Value | Grid | Tile count | Score multiplier |
|-------|------|------------|-----------------|
| `"easy"` | 3×3 | 9 | ×1 |
| `"medium"` | 4×4 | 16 | ×2 |
| `"hard"` | 5×5 | 25 | ×3 |

### GridSize

```typescript
type GridSize = 3 | 4 | 5;
// Derived from difficulty: easy → 3, medium → 4, hard → 5
```

### ImageMimeType

```typescript
type ImageMimeType = "image/jpeg" | "image/png" | "image/webp";
```

### ScoreAction (Image Puzzle)

```typescript
type ImagePuzzleScoreAction =
  | "tile-placed"    // tile dropped into a valid slot
  | "tile-swapped"   // dragged tile swapped with occupying tile
  | "hint-used"      // any assist feature activated (number hints)
  | "completed";     // all tiles locked in correct positions
```

### GameReadinessState

```typescript
type GameReadinessState = "generating" | "ready" | "unavailable";
// Image Puzzle is always "ready" immediately after image upload (no AI needed)
```

---

## 2. Resource Structures

### ResourceInput

```typescript
interface ResourceInput {
  type: "image";                       // G7 accepts image resources only
  file?: File;                         // Browser File object (from upload UI)
  dataUrl?: string;                    // Base64 data URL (programmatic injection via prop)
  mimeType: ImageMimeType;             // Validated MIME type
  sizeBytes: number;                   // File size in bytes (must be ≤ 8,388,608)
}
```

| Field | Type | Constraints |
|-------|------|-------------|
| `type` | `"image"` | Always `"image"` for G7 |
| `file` | `File \| undefined` | Present when user uploads; absent in controlled mode |
| `dataUrl` | `string \| undefined` | Present in controlled mode; absent on user upload (set after FileReader) |
| `mimeType` | `ImageMimeType` | Validated by magic byte sniff, not file extension |
| `sizeBytes` | `number` | Must be ≤ 8,388,608 (8 MB) |

---

## 3. Tile Structures

### Tile

```typescript
interface Tile {
  id: number;                          // Unique tile index (0 … N²-1)
  correctSlot: SlotIndex;             // Slot index where this tile belongs
  currentSlot: SlotIndex;             // Slot index where this tile currently sits
  isLocked: boolean;                  // True when tile is in correct position and locked
  isEdgeTile: boolean;                // True if correct position is on outer edge of grid
  gridRow: number;                    // Correct grid row (0-indexed)
  gridCol: number;                    // Correct grid column (0-indexed)
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Immutable; set at game start |
| `correctSlot` | `SlotIndex` | The slot this tile must occupy to be correct |
| `currentSlot` | `SlotIndex` | Changes on each successful drag operation |
| `isLocked` | `boolean` | Set to `true` after correct placement; immutable thereafter |
| `isEdgeTile` | `boolean` | Computed once: `row === 0 \|\| row === N-1 \|\| col === 0 \|\| col === N-1` |
| `gridRow` | `number` | Row in correct position (0 to N-1) |
| `gridCol` | `number` | Column in correct position (0 to N-1) |

### SlotIndex

```typescript
type SlotIndex = number;
// Range: 0 … (gridSize² - 1)
// Slot 0 = top-left; slot N²-1 = bottom-right
// Row-major order: slot i is at row = Math.floor(i / N), col = i % N
```

### TilePosition (CSS rendering)

```typescript
interface TilePosition {
  backgroundImage: string;            // `url(${dataUrl})`
  backgroundSize: string;             // `${imgW}px ${imgH}px`
  backgroundPositionX: string;        // `${-col * tileW}px`
  backgroundPositionY: string;        // `${-row * tileH}px`
  width: string;                      // `${tileW}px`
  height: string;                     // `${tileH}px`
}
```

---

## 4. Game State Structures

### PuzzleGameState

```typescript
interface PuzzleGameState {
  difficulty: Difficulty;
  gridSize: GridSize;                  // 3 | 4 | 5
  tiles: Tile[];                       // Length: gridSize²
  slots: SlotIndex[];                  // Length: gridSize²; slots[i] = tile id occupying slot i, or -1 if empty
  moveCount: number;                   // Incremented on each successful placement or swap
  hintUses: number;                    // Incremented on each hint activation
  ghostVisible: boolean;               // Ghost preview toggle state
  numberHintsVisible: boolean;         // Number hints toggle state
  startTimeMs: number;                 // Date.now() at game start
  isComplete: boolean;                 // True when all tiles locked
}
```

| Field | Type | Initial value | Description |
|-------|------|--------------|-------------|
| `difficulty` | `Difficulty` | User selection | Persisted for score calculation |
| `gridSize` | `GridSize` | Derived | 3, 4, or 5 |
| `tiles` | `Tile[]` | Shuffled | Array of all tile objects |
| `slots` | `SlotIndex[]` | Shuffled mapping | Which tile currently occupies each slot |
| `moveCount` | `number` | `0` | Incremented per successful drag |
| `hintUses` | `number` | `0` | Incremented per hint activation |
| `ghostVisible` | `boolean` | `false` | User-toggled |
| `numberHintsVisible` | `boolean` | `false` | User-toggled (off by default) |
| `startTimeMs` | `number` | `Date.now()` | Set on "Start Game" click |
| `isComplete` | `boolean` | `false` | Set when all tiles locked |

---

## 5. Event Structures

### ScoreEvent

```typescript
interface ScoreEvent {
  gameId: "image-puzzle";
  action: ImagePuzzleScoreAction;
  delta: number;                       // Points change (negative for penalties)
  runningTotal: number;                // Accumulated score after this event
  meta: {
    moveCount: number;
    hintUses: number;
    difficulty: Difficulty;
    gridSize: GridSize;
  };
}
```

### SessionResult

```typescript
interface SessionResult {
  gameId: "image-puzzle";
  finalScore: number;                  // Clamped to minimum 50
  moveCount: number;
  hintUses: number;
  timeTakenSeconds: number;            // Math.round((Date.now() - startTimeMs) / 1000)
  difficulty: Difficulty;
  gridSize: GridSize;
  completed: boolean;                  // true if all tiles placed correctly
}
```

### FullSession

```typescript
interface FullSession {
  resourceType: "image";
  gamesPlayed: SessionResult[];        // One entry per completed game in this session
  totalScore: number;                  // Sum of all SessionResult.finalScore
  sessionDurationSeconds: number;      // Total time from first game start to engine exit
}
```

---

## 6. Configuration Structures

### ThemeConfig

```typescript
interface ThemeConfig {
  primaryColor?: string;               // CSS colour, e.g. "#6366f1" (default: indigo)
  fontFamily?: string;                 // e.g. "Inter, sans-serif"
  borderRadius?: string;               // e.g. "8px"
}
```

### GameEngineProps (Full Component API)

```typescript
interface GameEngineProps {
  apiKey: string;                                         // Required
  games?: GameId[];                                       // Default: all 7
  theme?: ThemeConfig;                                    // Default: indigo
  difficulty?: Difficulty;                                // Default: "medium"
  locale?: string;                                        // Default: "en"
  onScore?: (data: ScoreEvent) => void;
  onGameComplete?: (data: SessionResult) => void;
  onSessionEnd?: (data: FullSession) => void;
  maxFileSize?: number;                                   // Bytes; default: 10485760
  hideUpload?: boolean;                                   // Default: false
  resource?: ResourceInput;                               // Controlled mode
}
```

---

## 7. Scoring Constants

```typescript
const SCORING = {
  BASE_SCORE:           1000,
  MOVE_PENALTY:         10,      // per move
  HINT_PENALTY:         100,     // per hint use
  DIFFICULTY_MULTIPLIER: {
    easy:   1,
    medium: 2,
    hard:   3,
  },
  MIN_SCORE:            50,
  MAX_SCORE_APPROX:     3000,
} as const;
```

### Score Formula

```
finalScore = max(
  (BASE_SCORE − moveCount × MOVE_PENALTY) × DIFFICULTY_MULTIPLIER[difficulty]
    − hintUses × HINT_PENALTY,
  MIN_SCORE
)
```

---

## 8. Session Store Schema

```typescript
interface SessionStore {
  // Uploaded resource
  uploadedResource: ResourceInput | null;

  // Per-game generated content (image-puzzle has no AI content)
  gameData: Partial<Record<GameId, GeneratedContent>>;

  // Per-game last results (shown as score badge on launcher)
  gameResults: Partial<Record<GameId, SessionResult>>;

  // Currently active game
  activeGame: GameId | null;
}
```

> All session data is stored **in-memory only**. No `localStorage`, `sessionStorage`, or cookies are used. Data is lost on page reload or tab close.

---

## 9. Validation Constraints Summary

| Field | Constraint | Error code |
|-------|------------|------------|
| Resource type | Must be JPG, PNG, or WEBP (magic byte validated) | `INVALID_TYPE` |
| Resource size | Must be ≤ 8,388,608 bytes (8 MB) | `FILE_TOO_LARGE` |
| Resource format | Must pass magic byte sniff | `CORRUPT_FORMAT` |
| Grid size | Derived from difficulty; only 3, 4, 5 are valid | n/a (internal) |
| Tile count | Must equal `gridSize²` | n/a (internal) |
| Final score | Clamped: `Math.max(rawScore, 50)` | n/a (clamped) |
| Move count | Incremented only on successful placement or swap | n/a (internal) |
