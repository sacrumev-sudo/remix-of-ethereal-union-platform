import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { StudentNavbar } from '@/components/StudentNavbar';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';

export function StudentLayout() {
  const { user, effectiveUser, isImpersonating } = useAuth();

  // If not logged in and not impersonating, redirect to login
  if (!user && !isImpersonating) {
    return <Navigate to="/login" replace />;
  }

  // If admin/assistant without impersonation, redirect to admin
  if (user && !isImpersonating && (user.role === 'admin' || user.role === 'assistant')) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background theme-student">
      <ImpersonationBanner />
      <StudentNavbar />
      <main className={`${isImpersonating ? 'pt-10' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
