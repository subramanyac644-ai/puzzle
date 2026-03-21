# Requirements — Image Puzzle Game (GameEngine G7)

> Derived strictly from GameEngine PRD v1.0

---

## 1. Overview

The Image Puzzle is game G7 within the GameEngine plugin. It is a spatial/memory game where the user uploads an image, which is split into an N×N tile grid and shuffled. The player reassembles the original image by dragging tiles into the correct positions.

---

## 2. Functional Requirements

### 2.1 Resource / Upload

| ID | Requirement |
|----|-------------|
| FR-01 | Accept image uploads in JPG, PNG, and WEBP formats |
| FR-02 | Enforce a maximum upload file size of 8 MB |
| FR-03 | Display the uploaded image at full width inside the plugin container upon upload |
| FR-04 | Allow the user to select difficulty before starting: Easy (3×3 = 9 pieces), Medium (4×4 = 16 pieces), Hard (5×5 = 25 pieces) |
| FR-05 | Provide a "Start game" button that shuffles pieces and begins the timer |

### 2.2 Tile Rendering

| ID | Requirement |
|----|-------------|
| FR-06 | Render each puzzle piece as an absolutely-positioned `<div>` using `background-image` and `background-position` to display the correct tile region of the source image |
| FR-07 | Pieces must be arranged in a grid matching the selected difficulty level |

### 2.3 Interaction Model — Drag & Drop

| ID | Requirement |
|----|-------------|
| FR-08 | Support mouse drag: `mousedown` captures piece, `mousemove` repositions it, `mouseup` attempts placement |
| FR-09 | Support touch drag: `touchstart` captures piece, `touchmove` repositions it, `touchend` attempts placement |
| FR-10 | On release, snap piece to the nearest valid empty slot within 40 px |
| FR-11 | If no valid slot is within 40 px, return the piece to its previous position |
| FR-12 | If the target slot is occupied, swap the dragged piece and the occupying piece |
| FR-13 | When a tile lands in its correct slot, display a green border for 600 ms, then lock the tile permanently in place |

### 2.4 Assist Features

| ID | Requirement |
|----|-------------|
| FR-14 | Ghost Preview: show the complete original image at 25% opacity beneath the board; must be toggleable by the user |
| FR-15 | Number Hints: display the correct grid index number on each tile (off by default) |
| FR-16 | Edge Highlight: tiles originating from the outer edge of the image receive a faint glow on hover |

### 2.5 Completion & Scoring

| ID | Requirement |
|----|-------------|
| FR-17 | Detect game completion when all tiles are in their correct positions |
| FR-18 | Trigger a win animation: tiles ripple in sequence |
| FR-19 | Show a completion overlay with the full score breakdown |
| FR-20 | Calculate score: `1,000 base − (10 × move count) × difficulty multiplier − (hint uses × 100)` |
| FR-21 | Difficulty multipliers: Easy = ×1, Medium = ×2, Hard = ×3 |
| FR-22 | Enforce a minimum score of 50 — completion must always be rewarded |
| FR-23 | Maximum achievable score per session: ~3,000 |

### 2.6 Common In-Game Features (inherited from engine)

| ID | Requirement |
|----|-------------|
| FR-24 | Display current score, round/move count, and lives remaining (if applicable) during play |
| FR-25 | Provide a Pause / Exit control that saves progress to session state and returns to the launcher |
| FR-26 | Provide 1–3 hints per round; each hint use deducts points from the score |
| FR-27 | Show a progress bar indicating puzzle completion percentage |
| FR-28 | Show a Results Screen on completion: score breakdown, time taken, "Play Again" and "Try Another Game" options |

---

## 3. Non-Functional Requirements

| ID | Requirement | Measurement |
|----|-------------|-------------|
| NFR-01 | Game launch from ready state < 200 ms | Time from click to first interactive frame |
| NFR-02 | Core bundle < 120 KB gzipped | `vite build --report` |
| NFR-03 | Image Puzzle component lazy-loaded via dynamic `import()` | Not included in initial bundle |
| NFR-04 | WCAG 2.1 AA accessibility compliance | Axe scan + manual keyboard test |
| NFR-05 | All interactive elements must be keyboard-navigable | Manual test |
| NFR-06 | ARIA labels on all game controls | Manual + automated audit |
| NFR-07 | Colour contrast AA compliant | Contrast checker |
| NFR-08 | Browser support: Chrome 100+, Firefox 100+, Safari 16+, Edge 100+ | BrowserStack automated tests |
| NFR-09 | 100% typed public API; no implicit `any` | `tsc --strict` with zero errors |
| NFR-10 | All error states must show a user-facing error message with a retry option | Simulated failure tests |

---

## 4. Configuration Props (relevant to Image Puzzle)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | required | Anthropic API key (passed at engine level) |
| `games` | `GameId[]` | all 7 | Must include `"image-puzzle"` to enable G7 |
| `theme` | `ThemeConfig` | indigo | Primary colour, font, border radius |
| `difficulty` | `"easy" \| "medium" \| "hard"` | `"medium"` | Override default difficulty selection |
| `onScore` | `(data: ScoreEvent) => void` | undefined | Fired after each scored action |
| `onGameComplete` | `(data: SessionResult) => void` | undefined | Fired when the puzzle is completed |
| `onSessionEnd` | `(data: FullSession) => void` | undefined | Fired when user exits the engine |
| `maxFileSize` | `number` (bytes) | `10485760` (10 MB) | Override upload size limit (puzzle max is 8 MB) |
| `hideUpload` | `boolean` | `false` | Hide upload UI; inject resource programmatically |
| `resource` | `ResourceInput` | undefined | Pre-load an image without user upload |

---

## 5. Success Metrics

| Metric | Target (3 months post-launch) | Measured by |
|--------|-------------------------------|-------------|
| Puzzle completion rate | > 60% of started puzzles completed | `SessionResult` events |
| Games played per session | ≥ 3 games (engine-wide) | `onGameComplete` events |
| Bundle size | < 120 KB gzipped core | CI bundle size check |