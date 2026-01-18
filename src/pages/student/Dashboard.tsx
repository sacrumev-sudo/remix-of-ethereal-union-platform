import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getPrograms, 
  getUserAccess, 
  getProgramProgress,
  getEvents,
  getTickets,
  addTicket,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  ArrowRight, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  BookOpen, 
  Send,
  CheckCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const { effectiveUser } = useAuth();
  const programs = getPrograms();
  const userAccess = effectiveUser ? getUserAccess(effectiveUser.id) : [];
  const events = getEvents();

  // Support chat state
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user's tickets for chat
  const userTickets = effectiveUser 
    ? getTickets().filter(t => t.userId === effectiveUser.id).reverse()
    : [];

  // Get user's accessible programs
  const accessiblePrograms = programs.filter(p => 
    userAccess.some(a => a.programId === p.id) && p.status === 'published'
  );

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 17) return 'Добрый день';
    if (hour < 21) return 'Добрый вечер';
    return 'Доброй ночи';
  };

  const userName = effectiveUser?.name || 'дорогая';

  // Today's date - January 18, 2026
  const today = new Date(2026, 0, 18);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

  // Get dates that have events (for calendar dots)
  const eventDates = useMemo(() => {
    return events.map(event => {
      const date = new Date(event.datetime);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    });
  }, [events]);

  // Get upcoming events (max 2)
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => new Date(e.datetime) >= today)
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
      .slice(0, 2);
  }, [events]);

  // Handle support message submission
  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!effectiveUser) return;
    if (!subject.trim() || !message.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    setIsSubmitting(true);

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

  // Check if date has event
  const hasEvent = (date: Date) => {
    const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    return eventDates.includes(dateTime);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Рада видеть вас в пространстве
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Programs Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Ваши программы</h2>
          </div>

          {accessiblePrograms.length > 0 ? (
            <div className="grid gap-4">
              {accessiblePrograms.map((program) => {
                const progress = effectiveUser 
                  ? getProgramProgress(effectiveUser.id, program.id) 
                  : 0;

                return (
                  <Link
                    key={program.id}
                    to={`/app/programs/${program.id}`}
                    className="premium-card group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                          {program.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {program.description}
                        </p>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Прогресс</span>
                            <span className="text-foreground font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="premium-card text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg text-foreground mb-2">
                У вас пока нет доступных программ
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Свяжитесь с нами для получения доступа
              </p>
              <Button 
                variant="outline" 
                className="border-gold text-gold hover:bg-gold/10"
                onClick={() => setIsSupportOpen(true)}
              >
                Написать в поддержку
              </Button>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Support Card with Chat */}
          <div className="premium-card">
            <button
              onClick={() => setIsSupportOpen(!isSupportOpen)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gold" />
                <h3 className="font-medium text-foreground">Обратная связь</h3>
              </div>
              {isSupportOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {!isSupportOpen && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Есть вопросы? Мы всегда рады помочь
                </p>
                <Button 
                  onClick={() => setIsSupportOpen(true)}
                  className="w-full bg-gold hover:bg-gold-dark text-primary-foreground"
                >
                  Написать
                </Button>
              </div>
            )}

            {isSupportOpen && (
              <div className="mt-4 space-y-4">
                {/* Chat History */}
                {userTickets.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-3 border-b border-border pb-4">
                    {userTickets.map((ticket) => (
                      <div key={ticket.id} className="space-y-2">
                        {/* User message */}
                        <div className="bg-gold/10 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gold">{ticket.subject}</span>
                            <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                              {ticket.status === 'open' ? 'Открыто' : 'Закрыто'}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">{ticket.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{ticket.createdAt}</p>
                        </div>
                        
                        {/* Admin reply */}
                        {ticket.adminReply && (
                          <div className="bg-muted rounded-lg p-3 ml-4">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-xs font-medium text-foreground">Ответ</span>
                            </div>
                            <p className="text-sm text-foreground">{ticket.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* New Message Form */}
                <form onSubmit={handleSubmitSupport} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs">Тема</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="О чём ваш вопрос?"
                      className="bg-background text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs">Сообщение</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Напишите ваш вопрос..."
                      rows={3}
                      className="bg-background resize-none text-sm"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gold hover:bg-gold-dark text-primary-foreground gap-2"
                    disabled={isSubmitting}
                    size="sm"
                  >
                    <Send className="w-3 h-3" />
                    {isSubmitting ? 'Отправка...' : 'Отправить'}
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Calendar Card */}
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-5 h-5 text-gold" />
              <h3 className="font-medium text-foreground">Календарь</h3>
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              defaultMonth={today}
              className="rounded-md border-0 w-full"
              modifiers={{
                hasEvent: (date) => hasEvent(date),
              }}
              modifiersStyles={{
                hasEvent: {
                  position: 'relative',
                },
              }}
              components={{
                DayContent: ({ date }) => {
                  const isEvent = hasEvent(date);
                  return (
                    <div className="relative flex items-center justify-center">
                      <span>{date.getDate()}</span>
                      {isEvent && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
                      )}
                    </div>
                  );
                },
              }}
            />
          </div>

          {/* Upcoming Event Card */}
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-5 h-5 text-gold" />
              <h3 className="font-medium text-foreground">Ближайшее событие</h3>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const date = new Date(event.datetime);
                  const formattedDate = date.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                  });
                  const formattedTime = date.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={event.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-gold mb-1">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{formattedTime}</span>
                      </div>
                      <p className="text-sm text-foreground">{event.title}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Нет предстоящих событий
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
