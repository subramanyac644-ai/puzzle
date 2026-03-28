'use client';

import UserDashboard from '../../components/Dashboard/UserDashboard';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <UserDashboard />
    </ProtectedRoute>
  );
}
