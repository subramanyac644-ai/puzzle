'use client';

import AdminDashboard from '../../components/Admin/AdminDashboard';
import ProtectedRoute from '../../components/Auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
