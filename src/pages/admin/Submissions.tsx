import { useState } from 'react';
import { getSubmissions, getUsers, getPrograms, updateSubmission, getProgramById } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateRu } from '@/lib/utils';

type FilterStatus = 'all' | 'submitted' | 'approved' | 'rejected';

export default function AdminSubmissions() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  
  const allSubmissions = getSubmissions();
  const users = getUsers();
  const programs = getPrograms();

  const submissions = filter === 'all' 
    ? allSubmissions 
    : allSubmissions.filter(s => s.status === filter);

  const handleApprove = (id: string) => {
    const reply = replyTexts[id] || 'Отличная работа!';
    updateSubmission(id, { status: 'approved', adminReply: reply });
    toast.success('ДЗ принято');
    setReplyTexts(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    window.location.reload();
  };

  const handleReject = (id: string) => {
    const reply = replyTexts[id] || 'Требуется доработка';
    updateSubmission(id, { status: 'rejected', adminReply: reply });
    toast.success('Отправлено на доработку');
    setReplyTexts(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    window.location.reload();
  };

  const updateReply = (id: string, text: string) => {
    setReplyTexts(prev => ({ ...prev, [id]: text }));
  };

  const counts = {
    all: allSubmissions.length,
    submitted: allSubmissions.filter(s => s.status === 'submitted').length,
    approved: allSubmissions.filter(s => s.status === 'approved').length,
    rejected: allSubmissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">Входящие ДЗ</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-gold hover:bg-gold-dark' : ''}
        >
          Все ({counts.all})
        </Button>
        <Button 
          variant={filter === 'submitted' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('submitted')}
          className={filter === 'submitted' ? 'bg-gold hover:bg-gold-dark' : ''}
        >
          Новые ({counts.submitted})
        </Button>
        <Button 
          variant={filter === 'approved' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('approved')}
          className={filter === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          Принятые ({counts.approved})
        </Button>
        <Button 
          variant={filter === 'rejected' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilter('rejected')}
          className={filter === 'rejected' ? 'bg-destructive hover:bg-destructive/90' : ''}
        >
          На доработке ({counts.rejected})
        </Button>
      </div>

      <div className="space-y-4">
        {submissions.map(sub => {
          const user = users.find(u => u.id === sub.userId);
          const program = getProgramById(sub.programId);
          let lessonTitle = '';
          if (program?.hasModules && program.modules) {
            program.modules.forEach(m => {
              const l = m.lessons.find(l => l.id === sub.lessonId);
              if (l) lessonTitle = l.title;
            });
          } else if (program?.lessons) {
            const l = program.lessons.find(l => l.id === sub.lessonId);
            if (l) lessonTitle = l.title;
          }

          return (
            <div key={sub.id} className="premium-card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">{user?.name || user?.email}</p>
                  <p className="text-sm text-muted-foreground">{program?.title} → {lessonTitle}</p>
                </div>
                <Badge variant={sub.status === 'submitted' ? 'default' : sub.status === 'approved' ? 'secondary' : 'destructive'}>
                  {sub.status === 'submitted' ? 'Новое' : sub.status === 'approved' ? 'Принято' : 'На доработке'}
                </Badge>
              </div>
              
              <div className="text-sm text-foreground bg-muted p-4 rounded-lg mb-4">
                {sub.content}
              </div>

              {/* Previous admin reply */}
              {sub.adminReply && sub.status !== 'submitted' && (
                <div className="mb-4 p-3 bg-gold/10 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Ваш ответ:</p>
                  <p className="text-sm text-foreground">{sub.adminReply}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{formatDateRu(sub.createdAt)}</span>
                
                {sub.status === 'submitted' && (
                  <div className="flex-1 ml-4 space-y-3">
                    <Textarea
                      value={replyTexts[sub.id] || ''}
                      onChange={(e) => updateReply(sub.id, e.target.value)}
                      placeholder="Напишите ответ ученице..."
                      rows={2}
                      className="text-sm"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleReject(sub.id)} 
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4 mr-1" /> На доработку
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(sub.id)} 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" /> Принять
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {submissions.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            {filter === 'all' ? 'Нет входящих ДЗ' : 'Нет заданий с таким статусом'}
          </p>
        )}
      </div>
    </div>
  );
}
