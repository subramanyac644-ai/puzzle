'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@core-hubble/shared/context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (adminOnly && user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, adminOnly, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading">Checking authentication...</div>
      </div>
    );
  }

  if (!user || (adminOnly && user.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
