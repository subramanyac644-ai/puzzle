# Skills & Implementation Guidance — Image Puzzle Game (GameEngine G7)

> Derived strictly from GameEngine PRD v1.0  
> This document captures key technical decisions, constraints, and implementation patterns required to build the Image Puzzle correctly.

---

## 1. Tile Rendering Skill

**Requirement (PRD §6.2):** Pieces rendered as absolutely-positioned divs using `background-image` and `background-position`.

### Pattern

Do **not** use `<canvas>` or `<img>` elements to render tiles. Each tile must be a `<div>` with CSS background properties:

```css
.tile {
  position: absolute;
  width: calc(100% / N);          /* N = grid size */
  height: calc(100% / N);
  background-image: url(IMAGE_DATA_URL);
  background-size: calc(100% * N) calc(100% * N);
  background-position: calc(-col * tileWidth) calc(-row * tileHeight);
  background-repeat: no-repeat;
}
```

This approach ensures:
- Pixel-perfect tile alignment without canvas rendering complexity
- CSS transforms handle drag positioning without layout reflows
- Correct tile region is always displayed regardless of container size

---

## 2. Drag-and-Drop Skill

**Requirement (PRD §6.2):** Mouse and touch event pairs; snap-to-grid within 40 px; swap on occupied slot.

### Event Pairing

Always implement **both** mouse and touch equivalents. Missing touch support on mobile breaks the game entirely.

| Action | Mouse Event | Touch Event |
|--------|-------------|-------------|
| Grab tile | `mousedown` | `touchstart` |
| Move tile | `mousemove` | `touchmove` |
| Release tile | `mouseup` | `touchend` |

### Snap Logic

```
On release (mouseup / touchend):
  1. Find the geometric centre of each empty slot
  2. Compute distance from dropped tile centre to each slot centre
  3. If min distance ≤ 40px → snap to that slot
  4. If min distance > 40px → return tile to previous position (no move counted)
```

### Swap Logic

```
If nearest slot within 40px is occupied:
  temp = slotA.tile
  slotA.tile = draggedTile
  slotB.tile = temp       ← slotB = previous position of draggedTile
```

Only **one** move is counted per drag-release, regardless of whether it results in a placement or swap.

### Prevent Default

Call `e.preventDefault()` on `touchmove` to prevent page scrolling during tile drag:

```javascript
boardElement.addEventListener("touchmove", (e) => {
  e.preventDefault();
  // … move logic
}, { passive: false });
```

---

## 3. Correct Placement Feedback Skill

**Requirement (PRD §6.2):** Green border for 600 ms, then tile locks permanently.

### Implementation

```javascript
function lockTile(tileEl) {
  tileEl.classList.add("correct");          // adds green border via CSS
  setTimeout(() => {
    tileEl.classList.add("locked");         // removes draggability
    tileEl.classList.remove("correct");     // removes green border
  }, 600);
}
```

A locked tile:
- Does **not** respond to `mousedown` / `touchstart`
- Cannot be used as a swap target
- Has its position permanently fixed in state

---

## 4. Ghost Preview Skill

**Requirement (PRD §6.3):** Original image at 25% opacity beneath the board; toggleable.

### Implementation

```css
.ghost-preview {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-image: url(IMAGE_DATA_URL);
  background-size: cover;
  opacity: 0.25;
  pointer-events: none;   /* must not intercept tile drag events */
  z-index: 0;             /* tiles sit above ghost (z-index: 1) */
}
```

The ghost is toggled by showing/hiding this element — it does **not** affect tile positions or event handling. `pointer-events: none` is critical.

---

## 5. Edge Highlight Skill

**Requirement (PRD §6.3):** Tiles from the outer edge of the original image receive a faint glow on hover.

### Identification

A tile is an "edge tile" if its correct grid position satisfies:

```
row === 0 || row === N-1 || col === 0 || col === N-1
```

This check is performed once at game start and stored as a property on each tile object.

### CSS

```css
.tile.edge-tile:hover {
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.4);
}
```

The glow must not appear on locked tiles (edge or otherwise).

---

## 6. Scoring Skill

**Requirement (PRD §6.4):** Score = `1000 − (10 × moves) × difficulty_multiplier − (hint_uses × 100)`. Minimum: 50.

### Key Decisions

- The **base** is 1,000 before any move penalty.
- The **difficulty multiplier** scales the net base (after move penalty), not the full 1,000.
- Hint penalty is **subtracted after** the multiplier is applied.
- Minimum score of 50 is enforced with `Math.max(score, 50)`.

```typescript
const raw = (1000 - moveCount * 10) * MULTIPLIER[difficulty] - hintUses * 100;
const finalScore = Math.max(raw, 50);
```

### When to Fire onScore

Fire `onScore` only at meaningful scored events:
- Each tile successfully placed or swapped (delta = 0 at placement; final delta computed on completion)
- Each hint use (delta = −100)
- Game completion (delta = finalScore)

Do not fire `onScore` on failed drops (tile returned to previous position).

---

## 7. Session State Skill

**Requirement (PRD §5.1 & security):** All state in-memory only. Never use `localStorage` or `sessionStorage`.

### State to Persist in Session (engine-wide)

- Uploaded image resource (data URL)
- Last result for Image Puzzle (shown as score badge on launcher card)

### State That Lives Only in Component

- Tile positions
- Move count
- Hint uses
- Ghost toggle state
- Number hint toggle state
- Timer start time

### Session Lifecycle

```
Upload → session created
Re-upload → session cleared → new session created
Browser tab closed → session lost (no persistence)
```

---

## 8. Lazy Loading Skill

**Requirement (PRD §9):** Each game lazy-loaded; not in initial bundle.

```typescript
// In GameShell or Launcher — never import ImagePuzzle statically
const ImagePuzzle = React.lazy(() => import("./games/image-puzzle/ImagePuzzle"));
```

Wrap with `<React.Suspense>`:

```tsx
<React.Suspense fallback={<LoadingSpinner />}>
  <ImagePuzzle ... />
</React.Suspense>
```

The Image Puzzle chunk must not be included in the initial `< 120 KB` core bundle.

---

## 9. Accessibility Skill

**Requirement (PRD §5.3 & §9):** All interactive elements keyboard-navigable; ARIA labels on game controls; colour contrast AA.

### Tile Accessibility

- Each tile must have `role="button"` and `tabIndex={0}`
- `aria-label` must describe current state: e.g., `"Tile 3, currently in position 7"`
- Support `Enter` / `Space` to select a tile, arrow keys to navigate the grid, and `Enter` / `Space` again to place in selected slot
- Locked tiles: `aria-disabled="true"`

### Controls

| Control | ARIA requirement |
|---------|-----------------|
| Ghost Preview toggle | `role="switch"`, `aria-checked` |
| Number Hints toggle | `role="switch"`, `aria-checked` |
| Pause / Exit button | `aria-label="Pause and exit to game launcher"` |
| Difficulty selector | `role="radiogroup"` with `role="radio"` options |

---

## 10. TypeScript Strictness Skill

**Requirement (PRD §9):** 100% typed public API; no implicit `any`; `tsc --strict` passes with zero errors.

### Rules

- All props interfaces must be explicitly typed — no `any`, no `object`
- All event callbacks must use the defined `ScoreEvent`, `SessionResult`, `FullSession` types
- All internal tile state must be typed (`Tile`, `SlotIndex`, `GridPosition`)
- `tsc --strict` must pass in CI with zero errors before merge

---

## 11. Image Validation Skill

**Requirement (PRD §5.1 & §6.1):** Type check, size check, format sniff.

Do not rely on file extension alone. Validate by reading the file's magic bytes:

| Format | Magic bytes (hex) |
|--------|------------------|
| JPEG | `FF D8 FF` |
| PNG | `89 50 4E 47` |
| WEBP | `52 49 46 46 … 57 45 42 50` |

```typescript
async function sniffFormat(file: File): Promise<"image/jpeg" | "image/png" | "image/webp"> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[8] === 0x57 && bytes[9] === 0x45) return "image/webp";
  throw new ResourceValidationError("INVALID_TYPE");
}
```

Size must be checked against 8 MB (8,388,608 bytes), not the engine-level `maxFileSize` prop (which defaults to 10 MB). The image puzzle has its own stricter cap.