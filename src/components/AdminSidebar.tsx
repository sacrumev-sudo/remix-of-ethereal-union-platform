import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CrownAvatar } from '@/components/CrownAvatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileCheck,
  MessageSquare,
  DollarSign,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', label: 'Главная', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Клиентки', icon: Users },
  { href: '/admin/programs', label: 'Программы', icon: BookOpen },
  { href: '/admin/submissions', label: 'Входящие ДЗ', icon: FileCheck },
  { href: '/admin/tickets', label: 'Обращения', icon: MessageSquare },
  { href: '/admin/finance', label: 'Финансы', icon: DollarSign },
  { href: '/admin/sales-pages', label: 'Прод. лендинги', icon: FileText },
];

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-border flex flex-col transition-all duration-300 z-50 shadow-sm',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <span className="font-display text-lg text-foreground">
            Эстетика
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href !== '/admin' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <CrownAvatar size="sm" name={user?.name} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role === 'admin' ? 'Администратор' : 'Ассистент'}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            'mt-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            collapsed ? 'w-full justify-center' : 'w-full justify-start'
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Выйти</span>}
        </Button>
      </div>
    </aside>
  );
}
