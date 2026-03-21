import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <div className="main-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Master the Art of <span className="text-gradient">Visual Puzzles</span></h1>
          <p className="hero-subtitle">
            Challenge your mind with stunning imagery and intricate puzzles. 
            Compete with friends, climb the leaderboard, and unlock your potential.
          </p>
          <div className="hero-actions">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-lg">Go to Dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg">Start Playing Now</button>
                <button onClick={() => navigate('/login')} className="btn btn-ghost btn-lg">Sign In</button>
              </>
            )}
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-image-blob"></div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🧩</div>
          <h3>Curated Puzzles</h3>
          <p>Beautiful, high-resolution images across multiple difficulty levels.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Global Rankings</h3>
          <p>Compete for the top spot on our global leaderboard.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Play</h3>
          <p>No downloads required. Jump straight into the action from your browser.</p>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
