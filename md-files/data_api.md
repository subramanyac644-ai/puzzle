# Data & API — Image Puzzle Game (GameEngine G7)

> Derived strictly from GameEngine PRD v1.0

---

## 1. Overview

The Image Puzzle game (G7) does **not** call the Claude API. It operates entirely on the uploaded image in the browser. This document covers:

- The public `<GameEngine />` prop API (relevant to G7)
- Event callback contracts
- TypeScript type definitions
- The internal service interface

---

## 2. Public Component API

The host application interacts with GameEngine exclusively through React props on `<GameEngine />`.

### Props Table

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `apiKey` | `string` | — | ✅ Yes | Anthropic API key (used by text games; passed at engine level) |
| `games` | `GameId[]` | all 7 | No | Restrict which games are available; include `"image-puzzle"` to expose G7 |
| `theme` | `ThemeConfig` | indigo | No | Primary colour, font family, border radius |
| `difficulty` | `"easy" \| "medium" \| "hard"` | `"medium"` | No | Override default difficulty pre-selection |
| `locale` | `string` | `"en"` | No | Language for UI strings (i18n) |
| `onScore` | `(data: ScoreEvent) => void` | — | No | Fired after each scored action |
| `onGameComplete` | `(data: SessionResult) => void` | — | No | Fired when a game session ends |
| `onSessionEnd` | `(data: FullSession) => void` | — | No | Fired when user exits the engine |
| `maxFileSize` | `number` (bytes) | `10485760` | No | Override upload size limit (image puzzle cap: 8 MB) |
| `hideUpload` | `boolean` | `false` | No | Hide upload UI; inject resource via `resource` prop |
| `resource` | `ResourceInput` | — | No | Pre-load an image programmatically (controlled mode) |

---

## 3. TypeScript Type Definitions

```typescript
// ─── Game Identifiers ─────────────────────────────────────────────

type GameId =
  | "impostor"
  | "spiral"
  | "speed-sniper"
  | "black-box"
  | "hangman"
  | "crossword"
  | "image-puzzle";   // G7

// ─── Resource Input ───────────────────────────────────────────────

interface ResourceInput {
  type: "image";                    // G7 accepts images only
  file?: File;                      // Browser File object (from upload)
  dataUrl?: string;                 // Base64 data URL (programmatic injection)
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes: number;
}

// ─── Theme ────────────────────────────────────────────────────────

interface ThemeConfig {
  primaryColor?: string;            // CSS colour value, e.g. "#6366f1"
  fontFamily?: string;              // e.g. "Inter, sans-serif"
  borderRadius?: string;            // e.g. "8px"
}

// ─── Score Event (fired per scored action) ────────────────────────

interface ScoreEvent {
  gameId: "image-puzzle";
  action: "tile-placed" | "tile-swapped" | "hint-used" | "completed";
  delta: number;                    // Points change (negative for penalties)
  runningTotal: number;             // Score after this action
  meta: {
    moveCount: number;
    hintUses: number;
    difficulty: "easy" | "medium" | "hard";
  };
}

// ─── Session Result (fired on game complete) ──────────────────────

interface SessionResult {
  gameId: "image-puzzle";
  finalScore: number;
  moveCount: number;
  hintUses: number;
  timeTakenSeconds: number;
  difficulty: "easy" | "medium" | "hard";
  gridSize: 3 | 4 | 5;
  completed: boolean;               // true if all tiles placed correctly
}

// ─── Full Session (fired on engine exit) ──────────────────────────

interface FullSession {
  resourceType: "image";
  gamesPlayed: SessionResult[];
  totalScore: number;
  sessionDurationSeconds: number;
}
```

---

## 4. Internal Service Interfaces

These are internal to the npm package and not part of the public API, but are included here for architectural reference.

### 4.1 ResourceService

```typescript
interface ResourceService {
  /**
   * Validates an uploaded file.
   * Throws ResourceValidationError on failure.
   */
  validate(file: File, maxBytes: number): Promise<void>;

  /**
   * Loads a validated image file into a data URL
   * and stores it in the session.
   */
  loadImage(file: File): Promise<ResourceInput>;
}

class ResourceValidationError extends Error {
  code: "INVALID_TYPE" | "FILE_TOO_LARGE" | "CORRUPT_FORMAT";
}
```

### 4.2 ScoreService

```typescript
interface ScoreService {
  /**
   * Calculates the final score for an image puzzle session.
   * Enforces minimum score of 50.
   */
  calculateImagePuzzleScore(params: {
    moveCount: number;
    hintUses: number;
    difficulty: "easy" | "medium" | "hard";
  }): number;
}

// Constants
const BASE_SCORE         = 1000;
const MOVE_PENALTY       = 10;   // per move
const HINT_PENALTY       = 100;  // per hint use
const DIFFICULTY_MULTIPLIER = { easy: 1, medium: 2, hard: 3 };
const MIN_SCORE          = 50;
const MAX_SCORE_APPROX   = 3000;
```

### 4.3 SessionStore

```typescript
interface SessionStore {
  // Resource
  uploadedResource: ResourceInput | null;

  // Per-game cached AI content (not applicable to image-puzzle)
  gameData: Partial<Record<GameId, GeneratedContent>>;

  // Per-game last results
  gameResults: Partial<Record<GameId, SessionResult>>;

  // Currently active game
  activeGame: GameId | null;

  // Methods
  setResource(resource: ResourceInput): void;
  setGameResult(gameId: GameId, result: SessionResult): void;
  clearSession(): void;
}
```

---

## 5. Event Callback Lifecycle

```
User uploads image
        │
        ▼
ResourceService.validate() → ResourceService.loadImage()
        │
        ▼
Image Puzzle card: "Ready"
        │
        ▼
User starts puzzle
        │
        ▼
[Each tile placement / swap]
  → onScore({ action: "tile-placed", delta: 0, ... })
        │
        ▼
[Each hint use]
  → onScore({ action: "hint-used", delta: -100, ... })
        │
        ▼
[All tiles locked]
  → onScore({ action: "completed", delta: finalScore, ... })
  → onGameComplete(SessionResult)
        │
        ▼
[User exits engine]
  → onSessionEnd(FullSession)
```

---

## 6. Claude API Usage (G7 Context)

The Image Puzzle game does **not** make any calls to the Claude API (`https://api.anthropic.com/v1/messages`). The engine's `GenerationService` is invoked only for text-based games (G1–G6) after a text/PDF resource is uploaded.

If the host passes only `games={["image-puzzle"]}`, the engine will still require an `apiKey` prop (for engine-level validation) but will not consume any API credits during puzzle play.

---

## 7. Security Constraints

| Constraint | Specification |
|------------|---------------|
| API key handling | The `apiKey` prop is used only in-memory for API calls; it is never logged, never stored in `localStorage` or `sessionStorage`, and never included in bundle output |
| Image data | Uploaded images are stored as in-memory `data URL` strings for the lifetime of the browser session only; they are never persisted |
| No backend | All processing happens client-side; no image data is transmitted to any server other than Anthropic's API (and G7 does not call that API) |