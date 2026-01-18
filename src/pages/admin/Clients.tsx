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

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.telegramUsername || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">Клиентки</h1>
      
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, email, telegram..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Имя</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Telegram</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Программы</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Активность</th>
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
                    <Link to={`/admin/clients/${user.id}`} className="text-foreground hover:text-gold">
                      {user.name || 'Без имени'}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                  <td className="py-3 px-4">
                    {user.telegramUsername ? (
                      <a href={`https://t.me/${user.telegramUsername}`} target="_blank" rel="noopener" className="text-gold hover:underline flex items-center gap-1">
                        @{user.telegramUsername} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {userPrograms.length > 0 ? userPrograms.join(', ') : '-'}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{formatDateRu(user.lastLoginAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
