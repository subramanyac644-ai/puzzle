import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthResponse } from '@core-hubble/shared/types';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const logoutSuccess = location.state?.logoutSuccess;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post<AuthResponse>('https://puzzle-api-z48f.onrender.com/api/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <button className="back-btn auth-back" onClick={() => navigate('/')}>← Back home</button>
      <div className="auth-card">
        <h2>Login</h2>
        {logoutSuccess && <div className="success-message">You have been successfully logged out.</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              autoComplete="off"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
          <br />
          <Link to="/" className="back-link">← Back to home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
