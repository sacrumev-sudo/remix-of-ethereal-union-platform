import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CrownAvatar } from '@/components/CrownAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Bell, BellOff } from 'lucide-react';

const navLinks = [
  { href: '/app', label: 'Главная' },
  { href: '/app/news', label: 'Новости' },
  { href: '/app/library', label: 'Библиотека' },
  { href: '/app/meditations', label: 'Медитации' },
  { href: '/app/support', label: 'Поддержка' },
];

export function StudentNavbar() {
  const { effectiveUser, logout, isImpersonating } = useAuth();
  const location = useLocation();

  return (
    <header className={`sticky ${isImpersonating ? 'top-10' : 'top-0'} z-40 bg-background/95 backdrop-blur border-b border-border`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/app" className="font-display text-lg text-name-shimmer">
            Эстетика
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`student-nav-link ${
                  location.pathname === link.href ? 'active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 focus:outline-none">
              <span className="hidden sm:block text-sm font-medium text-foreground">
                {effectiveUser?.name || 'Ученица'}
              </span>
              <CrownAvatar size="sm" name={effectiveUser?.name} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuItem className="flex items-center gap-2">
                {effectiveUser?.notificationsEnabled ? (
                  <>
                    <Bell className="w-4 h-4" />
                    Уведомления вкл.
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4" />
                    Уведомления выкл.
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Профиль
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-4 pb-3 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`student-nav-link whitespace-nowrap ${
                location.pathname === link.href ? 'active' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
