'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthResponse } from '@core-hubble/utils';
import { API_BASE_URL } from '@core-hubble/utils';
import { useAuth } from '@core-hubble/context';


const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, sessionExpired } = useAuth();
  const logoutSuccess = searchParams?.get('logoutSuccess');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, { username, password });
      
      // Update context
      login(data.user);
      
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button className="back-btn auth-back" onClick={() => router.push('/')}>← Back home</button>
      <div className="auth-card">
        <h2>Login</h2>
        {sessionExpired && <div className="error-message">Session expired, please login again.</div>}
        {logoutSuccess && <div className="success-message">You have been successfully logged out.</div>}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
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
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Don&apos;t have an account? <Link href="/register">Register here</Link></p>
          <Link href="/" className="back-link">← Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
