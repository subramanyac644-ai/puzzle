import React, { useState, useRef, useCallback, useEffect } from 'react';
import Tile from './Tile';
import { buildTiles, shuffleArray, isSolved } from './utils';
import type { TileData } from './utils';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

import { useAuth } from '../../context/AuthContext';


const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 8;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface Difficulty {
  label: string;
  grid: number;
  description: string;
  badge: string;
  multiplier: number;
}

const DIFFICULTIES: Difficulty[] = [
  { label: 'Easy',   grid: 3, description: '3 × 3 · 9 tiles',   badge: '🟢', multiplier: 1 },
  { label: 'Medium', grid: 4, description: '4 × 4 · 16 tiles',  badge: '🟡', multiplier: 2 },
  { label: 'Hard',   grid: 5, description: '5 × 5 · 25 tiles',  badge: '🔴', multiplier: 3 },
];

interface ImagePuzzleProps {
  externalImage?: string;
  level?: string;
  puzzleId?: string;
}

const ImagePuzzle: React.FC<ImagePuzzleProps> = ({ externalImage, level, puzzleId }) => {
  /* ── State ───────────────────────────────────────────────── */
  const [image, setImage]           = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(externalImage || null);
  const [imageSize, setImageSize]   = useState({ width: 0, height: 0 });
  const [error, setError]           = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [gridSize, setGridSize]     = useState(level === 'medium' ? 4 : level === 'hard' ? 5 : 3);
  const [gameStarted, setGameStarted] = useState(!!externalImage);
  const [tiles, setTiles]           = useState<TileData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [solved, setSolved]         = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isAnyTileDragging, setIsAnyTileDragging] = useState(false);
  const [moves, setMoves]           = useState(0);
  const [time, setTime]             = useState(0);
  const [isActive, setIsActive]     = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showGhost, setShowGhost]     = useState(true);
  const [highScore, setHighScore]     = useState<number>(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Load Image Size and Reset State on Change ───────────── */
  useEffect(() => {
    if (externalImage) {
      setPreview(externalImage);
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        // Reset game state for the new image
        setMoves(0);
        setTime(0);
        setSolved(false);
        setSelectedIndex(null);
        setIsActive(false);
        setGameStarted(true);
      };
      img.onerror = () => setError('Failed to load puzzle image.');
      img.src = externalImage;
    }
  }, [externalImage]);

  /* ── Load High Score ─────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem(`highScore_${gridSize}`);
    if (saved) setHighScore(parseInt(saved, 10));
  }, [gridSize]);

  /* ── Timer logic ─────────────────────────────────────────── */
  useEffect(() => {
    let interval: any;
    if (isActive && !solved) {
      interval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, solved]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  /* ── Init puzzle board when game starts ──────────────────── */
  useEffect(() => {
    if (gameStarted && preview && imageSize.width > 0) {
      handleShuffle(true);
    }
  }, [gameStarted, gridSize, preview, imageSize]);

  /* ── Shuffle with animation ──────────────────────────────── */
  const handleShuffle = (isInit = false) => {
    if (isShuffling) return;

    setIsShuffling(true);
    setSelectedIndex(null);
    if (!isInit) setSolved(false);

    const ordered = isInit ? buildTiles(gridSize) : tiles;
    const first  = shuffleArray([...ordered]);
    setTiles(first);

    setTimeout(() => {
      setTiles(shuffleArray([...first]));
      setMoves(0);
      setTime(0);
      setIsActive(true);
      setIsShuffling(false);
      setSolved(false);
    }, 280);
  };

  /* ── Upload helpers ──────────────────────────────────────── */
  const validateAndSet = (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImage(file);
      setPreview(url);
    };
    img.onerror = () => {
      setError('Failed to load image. Please try another file.');
    };
    img.src = url;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDifficultyChange = (newGrid: number) => {
    if (newGrid === gridSize) return;
    const proceed = moves === 0 || window.confirm('Are you sure you want to switch difficulty? Your current progress will be reset.');
    if (proceed) {
      setGridSize(newGrid);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setError(null);
    setGridSize(3);
    setGameStarted(false);
    setTiles([]);
    setSelectedIndex(null);
    setSolved(false);
    setMoves(0);
    setTime(0);
    setIsActive(false);
    setIsShuffling(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  /* ── Shared swap logic ───────────────────────────────────── */
  const swapTiles = (a: number, b: number) => {
    if (solved || isShuffling || a === b) return;
    const next = [...tiles];
    [next[a], next[b]] = [next[b], next[a]];
    setTiles(next);
    
    // Capture exact incremented moves to prevent race conditions during score calculation
    const newMoves = moves + 1;
    setMoves(newMoves);
    
    if (isSolved(next)) {
      setSolved(true);
      setIsActive(false);
      handleWin(newMoves);
    }
  };

  const handleWin = async (finalMoves: number) => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a78bfa', '#60a5fa', '#f472b6', '#fff'],
      zIndex: 1000,
    });

    const diffObj = DIFFICULTIES.find(d => d.grid === gridSize);
    const multiplier = diffObj?.multiplier || 1;
    // Calculate precise score using the exact number of moves that solved the board
    const currentScore = Math.max(50, (1000 - finalMoves * 10) * multiplier);
    
    // Local high score management
    const saved = localStorage.getItem(`highScore_${gridSize}`);
    const previousHigh = saved ? parseInt(saved, 10) : 0;
    if (currentScore > previousHigh) {
      localStorage.setItem(`highScore_${gridSize}`, currentScore.toString());
      setHighScore(currentScore);
    }

    // Save to backend using JWT cookies if logged in
    if (user && puzzleId) {
      try {
        await axios.post(`${API_BASE_URL}/api/scores`, {
          puzzleId,
          score: currentScore,
          level: diffObj?.label.toLowerCase() || 'easy'
        });
      } catch (err: any) {
        setError(`Success solving! But couldn't save score: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const handleNextLevel = () => {
    if (gridSize < 5) {
      setGridSize(prev => prev + 1);
      setGameStarted(true);
      setSolved(false);
    } else {
      setGameStarted(false);
    }
  };

  const handleChangeDifficulty = () => {
    navigate('/dashboard');
  };

  const handleNextPuzzle = async () => {
    if (!level) return;
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/puzzles/${level}`);
      // Sort puzzles by registration order (createdAt)
      const sorted = data.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      const currentIndex = sorted.findIndex((p: any) => p.id === puzzleId);
      if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
        const next = sorted[currentIndex + 1];
        navigate(`/play/${next.id}`);
      } else {
        alert("No more levels available");
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Failed to fetch next puzzle', err);
    }
  };

  const handleTileClick = (clickedIndex: number) => {
    if (solved || isShuffling) return;
    if (selectedIndex === null) {
      setSelectedIndex(clickedIndex);
      return;
    }
    if (selectedIndex === clickedIndex) {
      setSelectedIndex(null);
      return;
    }
    swapTiles(selectedIndex, clickedIndex);
    setSelectedIndex(null);
  };

  const handleDrop = (dragIndex: number, dropIndex: number) => {
    swapTiles(dragIndex, dropIndex);
  };

  const BOARD_PX = Math.min(480, window.innerWidth - 48);

  return (
    <div className="puzzle-wrapper">
      <h1 className="puzzle-title">Image Puzzle</h1>
      <p className="puzzle-subtitle">
        {!preview
          ? 'Upload an image to start the puzzle'
          : !gameStarted
          ? 'Choose your difficulty'
          : solved
          ? '🎉 Puzzle Solved!'
          : isShuffling
          ? 'Shuffling…'
          : `${gridSize}×${gridSize} — click two tiles to swap`}
      </p>

      {!preview && (
        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="upload-text">
            <span className="upload-link">Click to upload</span> or drag &amp; drop
          </p>
          <p className="upload-hint">JPG, PNG, WEBP · Max {MAX_SIZE_MB} MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {preview && !gameStarted && (
        <div className="config-section">
          <div className="preview-container preview-container--compact">
            <img src={preview} alt="Puzzle preview" className="preview-image" />
            <div className="preview-overlay">
              <span className="preview-filename">{image?.name || 'Puzzle Image'}</span>
            </div>
          </div>

          <div className="difficulty-grid">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.grid}
                className={`difficulty-card ${gridSize === d.grid ? 'active' : ''}`}
                onClick={() => setGridSize(d.grid)}
              >
                <span className="diff-badge">{d.badge}</span>
                <span className="diff-label">{d.label}</span>
                <span className="diff-desc">{d.description}</span>
                {gridSize === d.grid && <span className="diff-check">✓</span>}
              </button>
            ))}
          </div>

          <div className="preview-actions">
            {!externalImage && (
              <button className="btn btn-ghost" onClick={handleReset}>
                ✕ Change Image
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setGameStarted(true)}>
              Start Puzzle →
            </button>
          </div>
        </div>
      )}

      {preview && gameStarted && (
        <div className="board-section">
          <div className="stats-bar">
            {!externalImage && (
              <div className="difficulty-switcher-mini">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.grid}
                    className={`diff-btn ${gridSize === d.grid ? 'active' : ''}`}
                    onClick={() => handleDifficultyChange(d.grid)}
                    title={d.description}
                  >
                    <span className="diff-btn-badge">{d.badge}</span>
                    <span className="diff-btn-label">{d.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="stats-main">
              <div className="stat">
                <span className="stat-label">Moves</span>
                <span className="stat-value">{moves}</span>
              </div>
              <div className="stat stat--center">
                <span className="stat-label">Time</span>
                <span className="stat-value">{formatTime(time)}</span>
              </div>
            </div>
          </div>

          <div
            className={`puzzle-board ${solved ? 'board--solved' : ''} ${isShuffling ? 'board--shuffling' : ''} ${isAnyTileDragging ? 'board--dragging' : ''}`}
            style={{
              width:  BOARD_PX,
              height: BOARD_PX,
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows:    `repeat(${gridSize}, 1fr)`,
            }}
          >
            {showGhost && (
              <div 
                className="ghost-preview" 
                style={{ backgroundImage: `url(${preview})` }} 
              />
            )}

            {tiles.map((tile, idx) => {
              const row = Math.floor(idx / gridSize);
              const col = idx % gridSize;
              const isEdge = row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1;

              return (
                <Tile
                  key={tile.id}
                  id={tile.id}
                  index={idx}
                  imageUrl={preview}
                  gridSize={gridSize}
                  imageSize={imageSize}
                  isSelected={selectedIndex === idx}
                  isShuffling={isShuffling}
                  onClick={() => handleTileClick(idx)}
                  onDrop={handleDrop}
                  onDragChange={setIsAnyTileDragging}
                  showNumbers={showNumbers}
                  isEdge={isEdge}
                />
              );
            })}
          </div>

          <div className="game-options">
            <label className="option-label">
              <input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} />
              Show Numbers
            </label>
            <label className="option-label">
              <input type="checkbox" checked={showGhost} onChange={(e) => setShowGhost(e.target.checked)} />
              Ghost Preview
            </label>
          </div>

          <div className="board-controls">
            <button
              className={`btn btn-ghost ${isShuffling ? 'btn--spinning' : ''}`}
              onClick={() => handleShuffle(false)}
              disabled={isShuffling || solved}
            >
              ↺ Shuffle
            </button>
            {!externalImage && (
              <button className="btn btn-ghost" onClick={handleReset}>
                ✕ New Image
              </button>
            )}
          </div>
        </div>
      )}

      {solved && (() => {
        const diffObj = DIFFICULTIES.find(d => d.grid === gridSize);
        const multiplier = diffObj?.multiplier || 1;
        const currentScore = Math.max(50, (1000 - moves * 10) * multiplier);
        const isNewHigh = currentScore >= highScore && highScore > 0;

        return (
          <div className="modal-overlay">
            <div className="win-modal">
              <div className="modal-emoji">🎉</div>
              <h2 className="modal-title">Congratulations!</h2>
              <p className="modal-subtitle">You solved the puzzle!</p>
              {isNewHigh && <div className="new-high-badge">New High Score!</div>}
              <div className="score-main">
                <h1 className="score-display">{currentScore}</h1>
                <span className="score-label">Final Score</span>
              </div>
              <div className="modal-stats">
                <div className="modal-stat"><span className="stat-label">Moves</span><span className="stat-value">{moves}</span></div>
                <div className="modal-stat"><span className="stat-label">Time (s)</span><span className="stat-value">{time}</span></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => handleShuffle(true)}>Play Again</button>
                {puzzleId && <button className="btn btn-secondary" onClick={handleNextPuzzle}>Next Puzzle →</button>}
                <div className="modal-footer-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
                  <button className="btn btn-ghost btn-sm" onClick={handleChangeDifficulty}>Change Difficulty</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(user ? '/dashboard' : '/')}>Go to Home</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {error && <div className="error-banner"><span>⚠ {error}</span></div>}
    </div>
  );
};

export default ImagePuzzle;
