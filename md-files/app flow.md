# App Flow — Image Puzzle Game (GameEngine G7)

> Derived strictly from GameEngine PRD v1.0 · Sections 8 and 6

---

## 1. High-Level Flow Modes

The GameEngine supports three entry-point modes. The Image Puzzle participates in all three.

| Mode | Trigger | Upload UI shown? |
|------|---------|-----------------|
| First-time flow | User opens engine with no prior session | ✅ Yes |
| Returning flow (same session) | User returns to launcher in same browser session | ❌ No (cached) |
| Controlled mode | Host passes `resource` prop programmatically | ❌ No |

---

## 2. First-Time Flow (Standard Path)

```
┌─────────────────────────────────────────────────────────┐
│  1. Upload Screen                                        │
│     - Drag-and-drop zone: "Upload a resource to get      │
│       started"                                           │
│     - User selects or drops an image (JPG/PNG/WEBP ≤8MB) │
└──────────────────────────┬──────────────────────────────┘
                           │
                    File validation
                  (type · size · format)
                           │
              ┌────────────┴────────────┐
          FAIL │                         │ PASS
               ▼                         ▼
         Error message          Progress indicator shown
         + retry prompt
                                         │
                               AI generation starts
                               (background, parallel)
                                         │
                           ┌─────────────▼──────────────┐
                           │  2. Launcher Screen          │
                           │     - All 7 game cards show  │
                           │       "Generating…" state     │
                           │     - Image Puzzle card       │
                           │       becomes ready first     │
                           │       (no AI needed for G7)   │
                           └─────────────┬──────────────┘
                                         │
                              User clicks Image Puzzle card
                                         │
                           ┌─────────────▼──────────────┐
                           │  3. Puzzle Setup Screen      │
                           │     - Uploaded image shown   │
                           │       at full width          │
                           │     - Difficulty selector:   │
                           │       Easy / Medium / Hard   │
                           │     - "Start Game" button    │
                           └─────────────┬──────────────┘
                                         │
                              User selects difficulty
                              and clicks "Start Game"
                                         │
                           ┌─────────────▼──────────────┐
                           │  4. Active Puzzle Board      │
                           │     (see Section 3)          │
                           └─────────────┬──────────────┘
                                         │
                              All tiles correctly placed
                                         │
                           ┌─────────────▼──────────────┐
                           │  5. Results Screen           │
                           │     (see Section 4)          │
                           └─────────────────────────────┘
```

---

## 3. Active Puzzle Board — Detailed Interaction Flow

```
Board initialises
│
├── Image sliced into N×N tiles (N = 3 / 4 / 5 per difficulty)
├── Tiles shuffled randomly
├── Timer starts
└── Score counter set to 1,000 base

                    ┌──────────────────────────────┐
                    │  Player Interaction Loop       │
                    └──────────┬───────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                   │
     Drag tile             Toggle Ghost         Use Number
     (mouse/touch)         Preview              Hint
            │                  │                   │
            │              Overlay image        Show index
            │              at 25% opacity       on each tile
            │              under board          (deducts pts)
            │
     ┌──────▼──────┐
     │ On release   │
     └──────┬───────┘
            │
   ┌────────┴────────┐
   │                  │
Within 40px       Outside 40px
of valid slot     of any slot
   │                  │
   ▼                  ▼
Slot empty?      Return tile to
   │             previous position
┌──┴──┐
│     │
Yes   No (occupied)
│     │
│     Swap pieces
│
Snap tile to slot
   │
Correct position?
   │
┌──┴──┐
│     │
Yes   No
│     │
Green Continue
border loop
600ms
then
lock tile
   │
All tiles locked?
   │
Yes → Completion
```

---

## 4. Completion Flow

```
All tiles in correct positions detected
         │
         ▼
Ripple win animation plays (tiles animate in sequence)
         │
         ▼
Score calculated:
  1,000 base
  − (10 × total move count)
  × difficulty multiplier (×1 / ×2 / ×3)
  − (hint uses × 100)
  Minimum: 50
         │
         ▼
onScore event fired → host application
         │
         ▼
onGameComplete event fired → host application
         │
         ▼
┌─────────────────────────────────────────┐
│  Results Screen                          │
│  - Total score                           │
│  - Move count                            │
│  - Time taken                            │
│  - Difficulty multiplier applied         │
│  - Hints used                            │
│                                          │
│  [ Play Again ]   [ Try Another Game ]   │
└──────────────┬──────────────────────────┘
               │
   ┌───────────┴───────────┐
   │                        │
Play Again            Try Another Game
   │                        │
Restart puzzle         Return to Launcher
with same image        (same session cache)
and difficulty
```

---

## 5. Returning Flow (Same Browser Session)

```
User returns to Launcher
         │
         ▼
All 7 game cards shown as "Ready" (cached from first generation)
Image Puzzle card shows last score badge (if previously played)
         │
         ▼
User clicks Image Puzzle → Puzzle Setup Screen (step 3 above)
```

---

## 6. Controlled Mode (Host-Provided Resource)

```
Host passes resource prop to <GameEngine />
         │
         ▼
Engine skips upload UI entirely
         │
         ▼
Image Puzzle available immediately on component mount
         │
         ▼
User lands on Launcher → clicks Image Puzzle → Puzzle Setup Screen
```

---

## 7. Exit / Pause Flow

```
User clicks Pause / Exit during active puzzle
         │
         ▼
Current puzzle state saved to session state
(tile positions, move count, timer, score)
         │
         ▼
Return to Launcher
         │
onSessionEnd event fired if user exits engine entirely → host application
```
