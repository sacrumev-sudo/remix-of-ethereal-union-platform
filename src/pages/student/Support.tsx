import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTickets, addTicket } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentSupport() {
  const { effectiveUser } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's tickets
  const userTickets = effectiveUser 
    ? getTickets().filter(t => t.userId === effectiveUser.id).reverse()
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!effectiveUser) return;
    if (!subject.trim() || !message.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    setIsSubmitting(true);

    // Simulate delay
    setTimeout(() => {
      addTicket({
        userId: effectiveUser.id,
        subject: subject.trim(),
        message: message.trim(),
      });

      toast.success('Сообщение отправлено');
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl text-foreground mb-8">Поддержка</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="premium-card">
          <h2 className="font-display text-lg text-foreground mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gold" />
            Написать нам
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Тема</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="О чём ваш вопрос?"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Сообщение</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите ваш вопрос подробнее..."
                rows={5}
                className="bg-background resize-none"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gold hover:bg-gold-dark text-primary-foreground gap-2"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </form>

          {/* Telegram link */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              Или напишите напрямую:
            </p>
            <a
              href="https://t.me/ekaterina_volper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Telegram Екатерины
            </a>
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="font-display text-lg text-foreground mb-4">
            Ваши обращения
          </h2>

          {userTickets.length > 0 ? (
            <div className="space-y-4">
              {userTickets.map((ticket) => (
                <div key={ticket.id} className="premium-card">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-medium text-foreground">{ticket.subject}</h3>
                    <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                      {ticket.status === 'open' ? 'Открыто' : 'Закрыто'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {ticket.message}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {ticket.createdAt}
                  </p>

                  {ticket.adminReply && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-foreground">Ответ</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ticket.adminReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="premium-card text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                У вас пока нет обращений
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
