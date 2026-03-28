'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@core-hubble/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import { PuzzleGridSkeleton } from './PuzzleSkeleton';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

const UserDashboard: React.FC = () => {
  const [level, setLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { data: puzzles = [], error: fetchError, isLoading, mutate } = useSWR(
    `${API_BASE_URL}/api/puzzles/${level}`,
    fetcher
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setErrorMsg('');
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Only JPG, PNG, and WEBP formats are allowed.");
      e.target.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("File size exceeds 8MB limit.");
      e.target.value = '';
      return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('level', level); 
    
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/user/puzzles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      mutate(); 
    } catch(err) {
      console.error(err);
      setErrorMsg("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome Back, <span className="text-gradient">{user?.username}</span></h1>
          <p>Ready for your next challenge?</p>
        </div>
        <div className="difficulty-tabs">
          {['easy', 'medium', 'hard'].map((l) => (
            <button 
              key={l}
              className={`dashboard-tab ${level === l ? 'active' : ''}`}
              onClick={() => setLevel(l as any)}
            >
              {l.toUpperCase()}
            </button>
          ))}
          {user && (
            <div className="upload-action" style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
              <input type="file" ref={fileInputRef} onChange={handleUpload} style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.webp" />
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {errorMsg && <div className="error-banner" style={{ margin: '1rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}><span>⚠ {errorMsg}</span></div>}

      <div className="puzzle-grid">
        {isLoading ? (
          <PuzzleGridSkeleton />
        ) : (
          <>
            {puzzles.map((p: any) => {
              const normalizedUrl = p.imageUrl.startsWith('http') || p.imageUrl.startsWith('data:') ? p.imageUrl : `${API_BASE_URL}${p.imageUrl}`;
              return (
                <div key={p.id} className="puzzle-card" onClick={() => router.push(`/play/${p.id}`)}>
                  <div className="puzzle-card-inner">
                    <div className="puzzle-image-container">
                      <Image 
                        src={normalizedUrl} 
                        alt="Puzzle" 
                        className="puzzle-card-img" 
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={puzzles.indexOf(p) < 6}
                      />
                      <div className="puzzle-card-overlay">
                        <div className="play-hint">Play Now</div>
                      </div>
                    </div>
                    <div className="puzzle-card-content">
                      <div className="puzzle-card-info">
                        <span className="puzzle-level-badge">{level.toUpperCase()}</span>
                        <span className="puzzle-card-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="puzzle-card-title">Challenge Alpha</h3>
                    </div>
                  </div>
                </div>
              );
            })}
            {puzzles.length === 0 && (
              <div className="empty-state">
                <p>No puzzles available for this level yet.</p>
                {user?.role === 'admin' && (
                  <button onClick={() => router.push('/admin')} className="btn btn-secondary">Upload One</button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
