import React, { useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

export const TILE_DND_TYPE = 'PUZZLE_TILE';

export interface TileProps {
  id: number;
  index: number;
  imageUrl: string;
  gridSize: number;
  isSelected: boolean;
  isShuffling: boolean;
  onClick: () => void;
  onDrop: (dragIndex: number, dropIndex: number) => void;
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
  
  const { width, height } = imageSize;
  const imageAspectRatio = (width > 0 && height > 0) ? width / height : 1;

  const bgScale = imageAspectRatio > 1 
    ? { x: imageAspectRatio, y: 1 }
    : { x: 1, y: 1 / imageAspectRatio };

  const bgSizeX = `${bgScale.x * gridSize * 100}%`;
  const bgSizeY = `${bgScale.y * gridSize * 100}%`;

  const col = id % gridSize;
  const row = Math.floor(id / gridSize);
  
  const calculatePos = (scale: number, pos: number) => {
    const denominator = (scale * gridSize) - 1;
    if (denominator <= 0) return (pos / Math.max(1, gridSize - 1)) * 100;
    return ( (gridSize * (scale - 1) / 2) + pos ) / denominator * 100;
  };

  const posX = calculatePos(bgScale.x, col);
  const posY = calculatePos(bgScale.y, row);
  
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, { isDragging: boolean }>({
    type: TILE_DND_TYPE,
    item: { index },
    canDrag: !isShuffling,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    onDragChange?.(isDragging);
  }, [isDragging, onDragChange]);

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
