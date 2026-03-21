import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Image Puzzle</Link>
      </div>
      <ul className="navbar-links">
        {!user && <li><Link to="/">Home</Link></li>}
        {user && <li><Link to="/dashboard">Dashboard</Link></li>}
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        {user?.role === 'admin' && (
          <li><Link to="/admin">Admin</Link></li>
        )}
        {user ? (
          <>
            <li className="user-name">Welcome, {user.username}</li>
            <li><button onClick={handleLogout} className="btn btn-ghost">Logout</button></li>
          </>
        ) : (
          <li><Link to="/login" className="btn btn-primary">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
