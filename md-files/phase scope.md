# Phase Scope — Image Puzzle Game (GameEngine G7)

> Derived strictly from GameEngine PRD v1.0

---

## 1. v1 Launch Scope (In Scope)

Everything listed below is required at the initial production release of GameEngine v1.0. The Image Puzzle is one of 7 games shipping at launch.

### 1.1 Engine-Level (affects all games including G7)

| Feature | Description |
|---------|-------------|
| Pluggable npm package | Installable as a single npm dependency; no build step required on host side |
| Single React component API | Host drops in `<GameEngine />` with props; zero backend coupling |
| Resource ingestion pipeline | File validation (type, size, format sniff), loading, session storage |
| Game Launcher UI | Grid of game cards with readiness indicators, filter bar by mood tag |
| Session state (in-memory) | Cached game data for the lifetime of the browser session |
| Common in-game features | Score display, pause/exit, hint system, progress bar, results screen |
| Scoring system | Per-game base points, modifiers, and max scores defined |
| Configuration & theming | Full `ThemeConfig`, all props, event callbacks |
| TypeScript public API | 100% typed; `tsc --strict` passes with zero errors |
| Accessibility | WCAG 2.1 AA; keyboard navigation; ARIA labels; colour contrast AA |
| Browser support | Chrome 100+, Firefox 100+, Safari 16+, Edge 100+ |
| Bundle size | Core < 120 KB gzipped; each game lazy-loaded via dynamic `import()` |
| Security | API key never logged or stored in `localStorage` |
| Error handling | All failures show user-facing error + retry |
| Event callbacks | `onScore`, `onGameComplete`, `onSessionEnd` |
| Controlled mode | `resource` prop to pre-load resource without upload UI |

### 1.2 Image Puzzle — Specific Scope (G7)

| Feature | Description |
|---------|-------------|
| Image upload | Accept JPG, PNG, WEBP; max 8 MB |
| Full-width image preview | Display uploaded image at full width on upload |
| Difficulty selection | Easy (3×3 = 9 tiles), Medium (4×4 = 16 tiles), Hard (5×5 = 25 tiles) |
| Tile rendering | Absolutely-positioned divs with `background-image` / `background-position` |
| Drag-and-drop (mouse) | `mousedown` / `mousemove` / `mouseup` |
| Drag-and-drop (touch) | `touchstart` / `touchmove` / `touchend` |
| Snap-to-grid | Snap to nearest slot within 40 px; return if out of range |
| Tile swap | Swap dragged tile with occupying tile |
| Correct placement feedback | Green border for 600 ms → tile locks permanently |
| Ghost Preview | Full image at 25% opacity beneath board; toggleable |
| Number Hints | Grid index shown on each tile; off by default |
| Edge Highlight | Faint glow on hover for outer-edge tiles |
| Completion detection | Triggered when all tiles locked |
| Win animation | Tiles ripple in sequence |
| Scoring formula | `(1000 − 10×moves) × difficulty_multiplier − hint_uses×100`; min 50 |
| Difficulty multipliers | ×1 Easy / ×2 Medium / ×3 Hard |
| Results screen | Score breakdown, move count, time taken, difficulty applied, hints used |
| No Claude API calls | G7 operates on the image directly; no AI generation |

---

## 2. v1 Non-Goals (Explicitly Out of Scope)

These items are **not** to be built in v1, per the PRD.

| Out-of-Scope Item | Notes |
|-------------------|-------|
| Native mobile apps (React Native) | Web only in v1 |
| Multiplayer / real-time co-op | Single-player only |
| Persistent user accounts | Host manages persistence via callbacks |
| Cross-session leaderboards | No built-in persistence; session-only |
| Self-hosted AI model support | Claude API only in v1 |
| DOCX / PPTX resource types | Future v2 |
| URL / webpage scrape as resource | Future v2 |
| Animated tile physics | Not specified in PRD |
| Undo move feature | Not specified in PRD |
| Custom tile shapes (non-rectangular) | Not specified in PRD |
| Server-side image processing | All processing is client-side |

---

## 3. Future Scope (v2 Signals from PRD)

The PRD explicitly names the following as future work:

| Feature | Version Signal |
|---------|---------------|
| DOCX resource support | v2 |
| PPTX resource support | v2 |
| URL / webpage scrape as resource | v2 |
| React Native / native mobile | Post-v1 |

---

## 4. Delivery Milestones (Inferred from PRD Targets)

The PRD does not specify sprint dates, but defines these measurable targets that bound the v1 delivery:

| Milestone | Acceptance Criteria |
|-----------|---------------------|
| Engine integration | Developer can integrate GameEngine in < 30 minutes |
| Performance — generation | All 7 games generated within 8 s of upload (G7: instant, no AI) |
| Performance — launch | Game launches in < 200 ms from ready state |
| Bundle | Core bundle < 120 KB gzipped; each game lazy-loaded |
| Type safety | `tsc --strict` passes with zero errors |
| Accessibility | Axe scan passes; manual keyboard test passes |
| Puzzle completion rate | > 60% of started puzzles completed (measured 3 months post-launch) |
| Games per session | ≥ 3 games per user per resource upload (3 months post-launch) |
| npm downloads | 500+ weekly downloads after 3 months |

---

## 5. Game Catalogue Summary (All v1 Games)

| ID | Game | Type | Resource | Difficulty | Session Length |
|----|------|------|----------|------------|----------------|
| G1 | The Impostor | Deduction | Text / PDF | Easy → Hard | 5–12 min |
| G2 | The Spiral | Risk / Reward | Text / PDF | Medium → Expert | 4–8 min |
| G3 | Speed Sniper | Action / Reflex | Text / PDF | Easy | 3–6 min |
| G4 | Black Box | Deduction / Strategy | Text / PDF | Medium | 5–10 min |
| G5 | Hangman | Word / Spelling | Text / PDF | Easy → Medium | 2–5 min |
| G6 | Crossword | Word / Spatial | Text / PDF | Medium → Hard | 8–20 min |
| **G7** | **Image Puzzle** | **Spatial / Memory** | **Image (JPG/PNG/WEBP)** | **Easy → Expert** | **3–15 min** |