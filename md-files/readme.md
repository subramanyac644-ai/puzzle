# GameEngine — Image Puzzle (G7)

> Part of the **GameEngine** npm package · Resource-Powered Mini-Game Plugin  
> PRD v1.0 · Status: Draft

---

## What Is This?

GameEngine is a **standalone, pluggable npm package** that embeds AI-powered educational mini-games into any web application. Drop in a single React component, pass an API key and config, and get a fully-featured game engine — upload UI, game launcher, AI content generation, scoring, and event callbacks — with zero backend coupling.

The **Image Puzzle (G7)** is one of seven games shipping at v1 launch. It is a spatial/memory game where the user uploads an image (diagram, chart, infographic), which the engine splits into an N×N tile grid and shuffles. The player drags tiles to reassemble the original.

---

## Quick Start

```tsx
import { GameEngine } from "game-engine";

function App() {
  return (
    <GameEngine
      apiKey="your-anthropic-api-key"
      games={["image-puzzle"]}
      difficulty="medium"
      onGameComplete={(result) => console.log(result)}
    />
  );
}
```

No build step or backend required. The component handles everything.

---

## Image Puzzle — Feature Summary

| Feature | Detail |
|---------|--------|
| Resource type | Image — JPG, PNG, WEBP |
| Max file size | 8 MB |
| Difficulty modes | Easy (3×3 · 9 tiles) · Medium (4×4 · 16 tiles) · Hard (5×5 · 25 tiles) |
| Drag & drop | Mouse and touch supported |
| Snap-to-grid | Snaps within 40 px; swaps if slot occupied |
| Ghost Preview | Original image at 25% opacity (toggleable) |
| Number Hints | Grid index on each tile (off by default) |
| Edge Highlight | Faint glow on hover for outer-edge tiles |
| Scoring | `(1000 − 10×moves) × difficulty_mult − hint_uses×100`; min 50 |
| Max score | ~3,000 |
| Session length | 3–15 minutes |

---

## Installation

```bash
npm install game-engine
```

Requires React 18+ and TypeScript 5+.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | required | Anthropic API key |
| `games` | `GameId[]` | all 7 | Include `"image-puzzle"` to enable G7 |
| `theme` | `ThemeConfig` | indigo | Primary colour, font, border radius |
| `difficulty` | `"easy" \| "medium" \| "hard"` | `"medium"` | Default difficulty pre-selection |
| `locale` | `string` | `"en"` | UI language |
| `onScore` | `(data: ScoreEvent) => void` | — | Fired per scored action |
| `onGameComplete` | `(data: SessionResult) => void` | — | Fired on puzzle completion |
| `onSessionEnd` | `(data: FullSession) => void` | — | Fired on engine exit |
| `maxFileSize` | `number` (bytes) | `10485760` | Upload size override |
| `hideUpload` | `boolean` | `false` | Hide upload UI |
| `resource` | `ResourceInput` | — | Inject image programmatically |

---

## Controlled Mode (No Upload UI)

Pre-load an image without showing the upload screen:

```tsx
<GameEngine
  apiKey="..."
  games={["image-puzzle"]}
  hideUpload
  resource={{
    type: "image",
    dataUrl: myBase64DataUrl,
    mimeType: "image/png",
    sizeBytes: 204800,
  }}
  onGameComplete={handleResult}
/>
```

---

## Scoring

```
Final Score = max(
  (1000 − (10 × moves)) × difficulty_multiplier − (hints × 100),
  50
)
```

| Difficulty | Multiplier | Typical max |
|------------|------------|-------------|
| Easy (3×3) | ×1 | ~1,000 |
| Medium (4×4) | ×2 | ~2,000 |
| Hard (5×5) | ×3 | ~3,000 |

Minimum score is always **50** — completion is always rewarded.

---

## UX Flow

```
Upload screen → image validation → Launcher (Image Puzzle: Ready)
→ Difficulty selection → Active puzzle board
→ Drag tiles until all locked → Win animation → Results screen
→ Play again or return to Launcher
```

---

## Non-Functional Specs

| Concern | Target |
|---------|--------|
| Game launch time | < 200 ms from click to first interactive frame |
| Core bundle size | < 120 KB gzipped |
| Code splitting | Image Puzzle lazy-loaded via dynamic `import()` |
| Accessibility | WCAG 2.1 AA; full keyboard navigation; ARIA labels |
| Browser support | Chrome 100+, Firefox 100+, Safari 16+, Edge 100+ |
| TypeScript | `tsc --strict` zero errors |
| API key security | Never logged or stored in `localStorage` |

---

## Not in v1

- Native mobile (React Native)
- Multiplayer
- Persistent accounts or cross-session leaderboards
- Self-hosted AI models

---

## Document Index

| Document | Description |
|----------|-------------|
| `requirement.md` | Full functional and non-functional requirements |
| `app_flow.md` | End-to-end user flows and interaction diagrams |
| `architecture.md` | Package structure, component tree, state management |
| `data_API.md` | TypeScript types, prop API, event contracts |
| `phase_scope.md` | v1 in-scope, non-goals, future v2 signals |
| `readme.md` | This file — quick start and overview |
| `skills.md` | Key implementation decisions and technical guidance |
| `schema.md` | All data structures and their field definitions |

---

*GameEngine PRD · v1.0 · Confidential · Questions? Open a discussion in the project repo.*