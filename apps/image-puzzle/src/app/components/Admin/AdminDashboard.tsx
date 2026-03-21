import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Puzzle {
  id: string;
  imageUrl: string;
  level: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [level, setLevel] = useState('easy');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchPuzzles = async () => {
    setFetching(true);
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.get('http://localhost:3333/api/admin/puzzles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPuzzles(data);
    } catch (err) {
      console.error('Failed to fetch puzzles', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchUsers = async () => {
    setFetchingUsers(true);
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.get('http://localhost:3333/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchPuzzles();
    fetchUsers();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please select a valid image (JPG, PNG, or WEBP)');
      setFile(null);
      setPreview('');
      return;
    }

    if (selectedFile.size > 8 * 1024 * 1024) {
      setError('File size exceeds 8MB limit');
      setFile(null);
      setPreview('');
      return;
    }

    setFile(selectedFile);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image first');
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('level', level);

    try {
      await axios.post('http://localhost:3333/api/admin/puzzles', 
        formData,
        { headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } }
      );
      setMessage('Puzzle uploaded successfully!');
      setFile(null);
      setPreview('');
      setError('');
      fetchPuzzles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload puzzle');
      setMessage('');
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3333/api/admin/puzzles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Puzzle deleted successfully!');
      setDeletingId(null);
      fetchPuzzles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete puzzle');
    }
  };

  const handleDeleteUser = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3333/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('User deleted successfully!');
      setDeletingUserId(null);
      // Update UI instantly
      setUsers(users.filter(u => u.id !== id));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete user');
      setMessage('');
    }
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => navigate(user ? '/dashboard' : '/')}>← Back home</button>
      
      <div className="admin-grid">
        <div className="admin-card">
          <h2>Upload Puzzle</h2>
          <p>Directly upload JPG, PNG, or WEBP images (Max 8MB).</p>
          
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Select Image File</label>
              <div className="upload-dropzone">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange} 
                  required 
                  id="file-upload"
                  className="file-input-hidden"
                />
                <label htmlFor="file-upload" className="file-label">
                  {file ? file.name : "Click to browse or drag image here"}
                </label>
              </div>
            </div>

            {preview && (
              <div className="upload-preview-container">
                <p className="preview-label">Preview:</p>
                <img src={preview} alt="Upload preview" className="upload-preview" />
              </div>
            )}

            <div className="form-group">
              <label>Difficulty Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="easy">Easy (3x3)</option>
                <option value="medium">Medium (4x4)</option>
                <option value="hard">Hard (5x5)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={!file}>
              Upload Puzzle
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h2>Manage Puzzles</h2>
          <p>Total puzzles: {puzzles.length}</p>
          
          <div className="puzzle-list">
            {fetching ? (
              <p>Loading puzzles...</p>
            ) : puzzles.length === 0 ? (
              <p className="empty-state">No puzzles uploaded yet.</p>
            ) : (
              puzzles.map((p) => (
                <div key={p.id} className="puzzle-item">
                  <img src={p.imageUrl.startsWith('http') ? p.imageUrl : `http://localhost:3333${p.imageUrl}`} alt="Puzzle" className="puzzle-thumb" />
                  <div className="puzzle-info">
                    <span className={`badge badge-${p.level}`}>{p.level.toUpperCase()}</span>
                    <span className="p-id">ID: {p.id.substring(0, 8)}...</span>
                  </div>
                  <div className="puzzle-actions">
                    {deletingId === p.id ? (
                      <div className="inline-confirmation">
                        <span className="confirm-text">Are you sure?</span>
                        <div className="confirm-btns">
                          <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-xs">Yes</button>
                          <button onClick={() => setDeletingId(null)} className="btn btn-ghost btn-xs">No</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(p.id)} className="btn btn-danger btn-sm">Delete</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-card user-mgmt-card">
          <h2>User Management</h2>
          <div className="card-header-stats">
            <p>Total Manageable Users: {users.filter(u => u.role !== 'admin').length}</p>
          </div>
          
          <div className="user-table-container">
            {fetchingUsers ? (
              <p className="loading-text">Loading users...</p>
            ) : users.filter(u => u.role !== 'admin').length === 0 ? (
              <p className="empty-state">No manageable users found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Date Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role !== 'admin').map((u) => (
                    <tr key={u.id}>
                      <td className="font-medium">{u.username}</td>
                      <td>
                        <span className={`badge role-${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="user-actions">
                          {deletingUserId === u.id ? (
                            <div className="inline-confirmation">
                              <span className="confirm-text">Delete?</span>
                              <div className="confirm-btns">
                                <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger btn-xs">Yes</button>
                                <button onClick={() => setDeletingUserId(null)} className="btn btn-ghost btn-xs">No</button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeletingUserId(u.id)} 
                              className="btn btn-danger btn-sm"
                            >
                              Delete User
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
