import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/', { state: { logoutSuccess: true } });
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Image Puzzle</Link>
      </div>
      <ul className="navbar-links">
        {!user && <li><Link to="/">Home</Link></li>}
        {user && <li><Link to="/dashboard">Dashboard</Link></li>}
        {!isAuthPage && <li><Link to="/leaderboard">Leaderboard</Link></li>}
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
