// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // While Firebase is checking auth state...
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
        Checking authentication...
      </div>
    );
  }

  // Not logged in → go to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Logged in → show the protected page(s)
  return <Outlet />;
}
