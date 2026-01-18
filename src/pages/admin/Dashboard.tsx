import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUsers, getPayments, getSubmissions, getTickets } from '@/lib/storage';
import { Users, DollarSign, FileCheck, AlertCircle, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const users = getUsers().filter(u => u.role === 'student');
  const payments = getPayments();
  const submissions = getSubmissions().filter(s => s.status === 'submitted');
  const tickets = getTickets().filter(t => t.status === 'open');

  // Calculate metrics
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const revenue30 = payments
    .filter(p => new Date(p.date) >= last30Days && p.status !== 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const newUsers7 = users.filter(u => new Date(u.createdAt) >= last7Days).length;

  const installments = payments.filter(p => p.status === 'installment');
  const totalDebt = installments.reduce((sum, p) => sum + (p.installmentRemaining || 0), 0);

  const last14Days = new Date();
  last14Days.setDate(last14Days.getDate() - 14);
  const inactive = users.filter(u => new Date(u.lastLoginAt) < last14Days).length;

  const widgets = [
    { icon: TrendingUp, label: 'Выручка 30 дней', value: `${(revenue30 / 1000).toFixed(0)}K ₽`, href: '/admin/finance', color: 'text-green-500' },
    { icon: Users, label: 'Новые (7 дней)', value: newUsers7, href: '/admin/clients', color: 'text-blue-500' },
    { icon: DollarSign, label: 'Рассрочка', value: `${(totalDebt / 1000).toFixed(0)}K ₽`, href: '/admin/finance', color: 'text-gold' },
    { icon: FileCheck, label: 'Входящие ДЗ', value: submissions.length, href: '/admin/submissions', color: 'text-purple-500' },
    { icon: AlertCircle, label: 'Требуют внимания', value: inactive, href: '/admin/clients', color: 'text-red-500' },
    { icon: Activity, label: 'Открытые тикеты', value: tickets.length, href: '/admin/tickets', color: 'text-orange-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">
        Добро пожаловать, {user?.name}
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((w) => (
          <Link key={w.label} to={w.href} className="admin-widget">
            <div className="flex items-center gap-3">
              <w.icon className={`w-8 h-8 ${w.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{w.value}</p>
                <p className="text-sm text-muted-foreground">{w.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
