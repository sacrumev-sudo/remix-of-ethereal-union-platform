import { getTickets, getUsers, updateTicket } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDateRu } from '@/lib/utils';

export default function AdminTickets() {
  const tickets = getTickets();
  const users = getUsers();
  const [replies, setReplies] = useState<Record<string, string>>({});

  const handleReply = (id: string) => {
    if (!replies[id]?.trim()) return;
    updateTicket(id, { adminReply: replies[id].trim(), status: 'closed' });
    toast.success('Ответ отправлен');
    window.location.reload();
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">Обращения</h1>

      <div className="space-y-4">
        {tickets.map(ticket => {
          const user = users.find(u => u.id === ticket.userId);
          return (
            <div key={ticket.id} className="premium-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">{ticket.subject}</p>
                  <p className="text-sm text-muted-foreground">от {user?.name || user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateRu(ticket.createdAt)}</p>
                </div>
                <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                  {ticket.status === 'open' ? 'Открыто' : 'Закрыто'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{ticket.message}</p>
              {ticket.adminReply && (
                <div className="bg-green-500/10 p-3 rounded mb-3">
                  <p className="text-sm text-foreground">{ticket.adminReply}</p>
                </div>
              )}
              {ticket.status === 'open' && (
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Ваш ответ..." 
                    value={replies[ticket.id] || ''} 
                    onChange={(e) => setReplies({...replies, [ticket.id]: e.target.value})}
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={() => handleReply(ticket.id)}>Ответить</Button>
                </div>
              )}
            </div>
          );
        })}
        {tickets.length === 0 && <p className="text-muted-foreground text-center py-8">Нет обращений</p>}
      </div>
    </div>
  );
}
