import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function ImpersonationBanner() {
  const { isImpersonating, effectiveUser, endImpersonation } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isImpersonating || !effectiveUser) return null;

  const handleExit = () => {
    endImpersonation();
    // Navigate back to admin if we were in student area
    if (location.pathname.startsWith('/app')) {
      navigate('/admin/clients');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gold text-primary-foreground py-2 px-4 flex items-center justify-center gap-4 shadow-lg">
      <span className="font-medium">
        👁️ Режим просмотра: {effectiveUser.name || effectiveUser.email}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleExit}
        className="bg-primary-foreground text-gold hover:bg-primary-foreground/90"
      >
        <X className="w-4 h-4 mr-1" />
        В админку
      </Button>
    </div>
  );
}
