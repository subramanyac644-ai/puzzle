import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LevelSelection: React.FC = () => {
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPuzzles = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`https://puzzle-api-z48f.onrender.com/api/puzzles/${level}`);
        setPuzzles(data);
      } catch (error) {
        console.error('Failed to fetch puzzles', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPuzzles();
  }, [level]);

  return (
    <div className="selection-container">
      <div className="selection-header">
        <h1>Select Difficulty</h1>
        <div className="difficulty-tabs">
          {['easy', 'medium', 'hard'].map((l) => (
            <button 
              key={l}
              className={`selection-tab ${level === l ? 'active' : ''}`}
              onClick={() => setLevel(l as any)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="puzzle-grid">
        {loading ? (
          <div className="loading">Searching for challenges...</div>
        ) : (
          <>
            {puzzles.map((p) => {
              const normalizedUrl = p.imageUrl.startsWith('http') ? p.imageUrl : `https://puzzle-api-z48f.onrender.com${p.imageUrl}`;
              return (
                <div key={p.id} className="puzzle-card" onClick={() => navigate(`/play/${p.id}`)}>
                  <div className="puzzle-thumb" style={{ backgroundImage: `url(${normalizedUrl})` }}>
                    <div className="puzzle-overlay">
                      <button className="btn btn-primary">Play Now</button>
                    </div>
                  </div>
                  <div className="puzzle-info">
                    <span className="puzzle-date">Uploaded on {new Date(p.createdAt).toLocaleDateString()}</span>
                    <span className={`puzzle-tag tag--${level}`}>{level.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
            {puzzles.length === 0 && (
              <div className="empty-state">
                <p>No puzzles available for this level yet.</p>
                {JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="btn btn-secondary">Upload One</button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LevelSelection;
