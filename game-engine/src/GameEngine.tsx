import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ImagePuzzle, { ImagePuzzleProps } from './ImagePuzzle';

/**
 * The GameEngine component is the main entry point for the plugin.
 * It wraps the ImagePuzzle component with the necessary DndProvider.
 */
const GameEngine: React.FC<ImagePuzzleProps> = (props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ImagePuzzle {...props} />
    </DndProvider>
  );
};

export default GameEngine;
export { ImagePuzzle };
export type { ImagePuzzleProps };
