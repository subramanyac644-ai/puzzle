import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';


interface Ranking {
  rank: number;
  username: string;
  score: number;
}

const Leaderboard: React.FC = () => {
  const [level, setLevel] = useState('easy');
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/leaderboard/${level}`);
        setRankings(data);
      } catch (error) {
        console.error('Failed to fetch rankings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [level]);

  return (
    <div className="leaderboard-container">
      <button className="back-btn" onClick={() => navigate(user ? '/dashboard' : '/')}>← Back home</button>
      <div className="leaderboard-card">
        <h2>Global Leaderboard</h2>
        
        <div className="tab-group">
          {['easy', 'medium', 'hard'].map((l) => (
            <button 
              key={l}
              className={`tab-btn ${level === l ? 'active' : ''}`}
              onClick={() => setLevel(l)}
            >
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading rankings...</div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr key={`${r.username}-${r.rank}`} className={r.rank <= 3 ? `top-${r.rank}` : ''}>
                  <td>{r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank}</td>
                  <td>{r.username}</td>
                  <td className="score-val">{r.score}</td>
                </tr>
              ))}
              {rankings.length === 0 && (
                <tr>
                  <td colSpan={3} className="empty-state">No scores yet for this level.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
