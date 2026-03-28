'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_BASE_URL } from '@core-hubble/utils';

import ImagePuzzle from '../ImagePuzzle/ImagePuzzle';

const PuzzlePlayer: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const fetchPuzzle = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/puzzles/single/${id}`);
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
    return url.startsWith('http') || url.startsWith('data:') ? url : `${API_BASE_URL}${url}`;
  };

  if (loading) return <div className="loading">Loading puzzle...</div>;
  if (!puzzle) return <div className="error">Puzzle not found. <button onClick={() => router.push('/')}>Go back</button></div>;

  return (
    <div className="player-container">
      <button className="back-btn" onClick={() => router.push(user ? '/dashboard' : '/')}>← Back home</button>
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
