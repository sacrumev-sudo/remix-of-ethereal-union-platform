import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, getPayments, getUserAccess, getPrograms } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink } from 'lucide-react';
import { formatDateRu } from '@/lib/utils';

export default function AdminClients() {
  const [search, setSearch] = useState('');
  const users = getUsers().filter(u => u.role === 'student');
  const payments = getPayments();
  const programs = getPrograms();

  // Search across ALL columns: name, email, telegram, and programs
  const filtered = users.filter(u => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return true;
    
    // Get user's programs for search
    const access = getUserAccess(u.id);
    const userPrograms = access
      .map(a => programs.find(p => p.id === a.programId)?.title || '')
      .join(' ')
      .toLowerCase();
    
    // Get user activity date
    const activityDate = formatDateRu(u.lastLoginAt).toLowerCase();
    
    return (
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.telegramUsername || '').toLowerCase().includes(searchLower) ||
      userPrograms.includes(searchLower) ||
      activityDate.includes(searchLower)
    );
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">Клиентки</h1>
      
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по всем колонкам..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-foreground/70 font-medium">Имя</th>
              <th className="text-left py-3 px-4 text-foreground/70 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-foreground/70 font-medium">Telegram</th>
              <th className="text-left py-3 px-4 text-foreground/70 font-medium">Программы</th>
              <th className="text-left py-3 px-4 text-foreground/70 font-medium">Активность</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const access = getUserAccess(user.id);
              const userPrograms = access.map(a => programs.find(p => p.id === a.programId)?.title).filter(Boolean);
              const userPayments = payments.filter(p => p.userId === user.id && p.status === 'installment');
              const debt = userPayments.reduce((s, p) => s + (p.installmentRemaining || 0), 0);

              return (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <Link to={`/admin/clients/${user.id}`} className="text-foreground font-medium hover:text-primary">
                      {user.name || 'Без имени'}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-foreground/80">{user.email}</td>
                  <td className="py-3 px-4">
                    {user.telegramUsername ? (
                      <a href={`https://t.me/${user.telegramUsername}`} target="_blank" rel="noopener" className="text-primary hover:underline flex items-center gap-1">
                        @{user.telegramUsername} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-foreground/80">
                    {userPrograms.length > 0 ? userPrograms.join(', ') : '-'}
                  </td>
                  <td className="py-3 px-4 text-foreground/80">{formatDateRu(user.lastLoginAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
