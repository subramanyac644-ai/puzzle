// Utility functions for the ImagePuzzle game

/** A single puzzle tile — tracks its correct position and current display. */
export interface TileData {
  id: number;        // correct position index (0 … n²-1)
  currentIndex: number; // where it sits right now in the shuffled array
}

/**
 * Build an ordered tile array for an n×n grid.
 * id === currentIndex === position when solved.
 */
export function buildTiles(gridSize: number): TileData[] {
  const total = gridSize * gridSize;
  return Array.from({ length: total }, (_, i) => ({ id: i, currentIndex: i }));
}

/**
 * Given a tile id and gridSize, return its correct
 * CSS background-position percentages.
 *
 * Formula: x = col / (n-1) * 100,  y = row / (n-1) * 100
 * This maps perfectly when background-size is n*100%.
 */
export function getTilePosition(
  id: number,
  gridSize: number
): { x: number; y: number } {
  const col = id % gridSize;
  const row = Math.floor(id / gridSize);
  const step = gridSize === 1 ? 0 : 100 / (gridSize - 1);
  return { x: col * step, y: row * step };
}

/**
 * Shuffle an array using the Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Check if the puzzle is solved (tile ids match their position indices).
 */
export function isSolved(tiles: TileData[]): boolean {
  return tiles.every((tile, index) => tile.id === index);
}
