'use client';

import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getTilePosition } from './utils';

export const TILE_DND_TYPE = 'PUZZLE_TILE';

export interface TileProps {
  /** Correct position id — determines which image slice to show */
  id: number;
  /** Current position in the tiles array */
  index: number;
  imageUrl: string;
  gridSize: number;
  isSelected: boolean;
  isShuffling: boolean;
  onClick: () => void;
  /** Called when a tile is dropped onto this one — swaps them */
  onDrop: (dragIndex: number, dropIndex: number) => void;
  /** Notifies parent when dragging starts/ends */
  onDragChange?: (isDragging: boolean) => void;
  showNumbers: boolean;
  isEdge: boolean;
  imageSize: { width: number, height: number };
}

interface DragItem {
  index: number;
}

const Tile: React.FC<TileProps> = ({
  id, index, imageUrl, gridSize, imageSize,
  isSelected, isShuffling, onClick, onDrop, onDragChange,
  showNumbers, isEdge
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Calculate Background Logic for Center-Crop
  // We scale the image so it "covers" the square board, then slice it.
  const { width, height } = imageSize;
  const imageAspectRatio = (width > 0 && height > 0) ? width / height : 1;

  // Multipliers relative to a square tile
  const bgScale = imageAspectRatio > 1 
    ? { x: imageAspectRatio, y: 1 }      // Landscape
    : { x: 1, y: 1 / imageAspectRatio }; // Portrait

  const bgSizeX = `${bgScale.x * gridSize * 100}%`;
  const bgSizeY = `${bgScale.y * gridSize * 100}%`;

  // The tile 'id' determines which slice of the original image we show.
  const col = id % gridSize;
  const row = Math.floor(id / gridSize);
  
  // Universal Center-Crop background position formula:
  // This calculates the percentage needed to align the slice correctly 
  // within an image that has been centered-scaled to cover the board.
  const calculatePos = (scale: number, pos: number) => {
    const denominator = (scale * gridSize) - 1;
    // Fallback for edge cases, though gridSize is always >= 3 here
    if (denominator <= 0) return (pos / Math.max(1, gridSize - 1)) * 100;
    return ( (gridSize * (scale - 1) / 2) + pos ) / denominator * 100;
  };

  const posX = calculatePos(bgScale.x, col);
  const posY = calculatePos(bgScale.y, row);
  
  /* ── useDrag ─────────────────────────────────────────────── */
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: TILE_DND_TYPE,
    item: { index },
    canDrag: !isShuffling,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Sync dragging state to parent
  React.useEffect(() => {
    onDragChange?.(isDragging);
  }, [isDragging, onDragChange]);

  /* ── useDrop ─────────────────────────────────────────────── */
  const [{ isOver }, drop] = useDrop<DragItem, unknown, { isOver: boolean }>({
    accept: TILE_DND_TYPE,
    drop: (item) => {
      if (item.index !== index) {
        onDrop(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Attach both drag and drop to the same element
  drag(drop(ref));

  const style: React.CSSProperties = {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${bgSizeX} ${bgSizeY}`,
    backgroundPosition: `${posX}% ${posY}%`,
    backgroundRepeat: 'no-repeat',
    opacity: isDragging ? 0.35 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const classes = [
    'puzzle-tile',
    isSelected  ? 'selected'  : '',
    isOver      ? 'tile--over' : '',
    isDragging  ? 'tile--dragging' : '',
    isEdge      ? 'tile--edge' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={style}
      onClick={onClick}
      title={`Tile ${id}`}
    >
      {showNumbers && (
        <span className="tile-hint">{id + 1}</span>
      )}
    </div>
  );
};

export default Tile;
