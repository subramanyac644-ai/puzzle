'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@core-hubble/shared/context';

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login?logoutSuccess=true');
  };

  const showLeaderboard = !!user && pathname !== '/';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link href="/">Image Puzzle</Link>
      </div>
      <ul className="navbar-links">
        {!user && <li><Link href="/">Home</Link></li>}
        {user && <li><Link href="/dashboard">Dashboard</Link></li>}
        {showLeaderboard && <li><Link href="/leaderboard">Leaderboard</Link></li>}
        {user?.role === 'admin' && (
          <li><Link href="/admin">Admin</Link></li>
        )}
        {user ? (
          <>
            <li className="user-name">Welcome, {user.username}</li>
            <li><button onClick={handleLogout} className="btn btn-ghost">Logout</button></li>
          </>
        ) : (
          <li><Link href="/login" className="btn btn-primary">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
