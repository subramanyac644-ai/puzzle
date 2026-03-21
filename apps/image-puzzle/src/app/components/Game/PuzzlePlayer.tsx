import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ImagePuzzle from '../ImagePuzzle/ImagePuzzle';

const PuzzlePlayer: React.FC = () => {
  const { id } = useParams();
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchPuzzle = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:3333/api/puzzles/single/${id}`);
        setPuzzle(data);
      } catch (error) {
        console.error('Failed to fetch puzzle', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPuzzle();
  }, [id]);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `http://localhost:3333${url}`;
  };

  if (loading) return <div className="loading">Loading puzzle...</div>;
  if (!puzzle) return <div className="error">Puzzle not found. <button onClick={() => navigate('/')}>Go back</button></div>;

  return (
    <div className="player-container">
      <button className="back-btn" onClick={() => navigate(user ? '/dashboard' : '/')}>← Back home</button>
      <ImagePuzzle 
        key={puzzle.id}
        externalImage={getImageUrl(puzzle.imageUrl)} 
        level={puzzle.level} 
        puzzleId={puzzle.id} 
      />
    </div>
  );
};

export default PuzzlePlayer;
