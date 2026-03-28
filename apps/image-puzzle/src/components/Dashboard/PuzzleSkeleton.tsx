import React from 'react';

const PuzzleSkeleton: React.FC = () => {
  return (
    <div className="puzzle-card skeleton">
      <div className="puzzle-card-inner">
        <div className="puzzle-image-container skeleton-box"></div>
        <div className="puzzle-card-content">
          <div className="puzzle-card-info">
            <div className="skeleton-badge"></div>
            <div className="skeleton-text-sm"></div>
          </div>
          <div className="skeleton-title"></div>
        </div>
      </div>
    </div>
  );
};

export const PuzzleGridSkeleton: React.FC = () => {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <PuzzleSkeleton key={i} />
      ))}
    </>
  );
};

export default PuzzleSkeleton;
