import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/AdminSidebar';

export function AdminLayout() {
  const { user } = useAuth();

  // Check if user is admin or assistant
  if (!user || (user.role !== 'admin' && user.role !== 'assistant' && user.role !== 'developer')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background theme-admin">
      <AdminSidebar />
      <main className="ml-16 lg:ml-64 min-h-screen transition-all duration-300">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
