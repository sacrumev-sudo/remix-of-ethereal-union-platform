import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getProgramById, 
  getLessonById,
  getLessonProgress, 
  updateLessonProgress,
  addSubmission,
  getSubmissions,
  getAllLessonIdsFromOutline,
} from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  CheckCircle, 
  ChevronDown,
  Star,
  Send,
  FileText,
  Download,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Lesson, LessonBlock } from '@/data/mockData';
import LessonProgress from '@/components/student/LessonProgress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function StudentLesson() {
  const { programId, lessonId } = useParams();
  const { effectiveUser } = useAuth();
  const navigate = useNavigate();

  const [videoWatched, setVideoWatched] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [practiceContent, setPracticeContent] = useState('');
  const [showStructure, setShowStructure] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [checklistChecked, setChecklistChecked] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({});
  const [practiceChecked, setPracticeChecked] = useState<Record<string, boolean>>({});

  const program = programId ? getProgramById(programId) : null;
  const currentLesson = lessonId ? getLessonById(lessonId) : null;

  // Get all lesson IDs for navigation
  const allLessonIds = program ? getAllLessonIdsFromOutline(program.outline) : [];
  const currentIndex = lessonId ? allLessonIds.indexOf(lessonId) : -1;
  const prevLessonId = currentIndex > 0 ? allLessonIds[currentIndex - 1] : null;
  const nextLessonId = currentIndex < allLessonIds.length - 1 ? allLessonIds[currentIndex + 1] : null;

  useEffect(() => {
    const saved = localStorage.getItem('estetika_favorites');
    if (saved) setFavoriteIds(JSON.parse(saved));
  }, []);

  // Load task states from localStorage
  useEffect(() => {
    if (effectiveUser && lessonId) {
      const key = `ek_task_state:${effectiveUser.id}:${lessonId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          setTaskStates(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading task states:', e);
        }
      }
      
      // Load practice checkbox states
      const practiceKey = `ek_practice_checks:${effectiveUser.id}:${lessonId}`;
      const savedPractice = localStorage.getItem(practiceKey);
      if (savedPractice) {
        try {
          setPracticeChecked(JSON.parse(savedPractice));
        } catch (e) {
          console.error('Error loading practice states:', e);
        }
      }
    }
  }, [effectiveUser, lessonId]);

  const toggleFavorite = (id: string) => {
    const updated = favoriteIds.includes(id) 
      ? favoriteIds.filter(f => f !== id)
      : [...favoriteIds, id];
    setFavoriteIds(updated);
    localStorage.setItem('estetika_favorites', JSON.stringify(updated));
    toast.success(updated.includes(id) ? 'Добавлено в избранное' : 'Удалено из избранного');
  };

  if (!program || !currentLesson) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="font-display text-2xl text-foreground mb-4">Урок не найден</h1>
        <Button asChild variant="outline">
          <Link to="/app">← На главную</Link>
        </Button>
      </div>
    );
  }

  const progress = effectiveUser ? getLessonProgress(effectiveUser.id, currentLesson.id) : null;
  const submissions = effectiveUser 
    ? getSubmissions().filter(s => s.userId === effectiveUser.id && s.lessonId === currentLesson.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const lastSubmission = submissions[0];
  const canSubmitAgain = !lastSubmission || lastSubmission.status === 'rejected';

  const hasVideo = currentLesson.blocks.some(b => b.type === 'video');
  const hasPractice = currentLesson.practice?.enabled;
  const hasTasks = (currentLesson.tasks ?? []).length > 0;
  const hasCheckboxPractice = hasPractice && currentLesson.practice?.type === 'checkboxes';
  const checkboxPracticeItems = currentLesson.practice?.checkboxItems ?? [];
  const currentPercent = progress?.percent || 0;
  const isFavorite = favoriteIds.includes(currentLesson.id);

  // Handle task checkbox toggle
  const handleTaskToggle = (taskId: string, checked: boolean) => {
    if (!effectiveUser || !lessonId) return;
    
    const newStates = { ...taskStates, [taskId]: checked };
    setTaskStates(newStates);
    
    // Save to localStorage
    const key = `ek_task_state:${effectiveUser.id}:${lessonId}`;
    localStorage.setItem(key, JSON.stringify(newStates));
    
    toast.success(checked ? 'Задача выполнена!' : 'Отметка снята');
  };

  // Handle practice checkbox toggle
  const handlePracticeCheck = (index: number, checked: boolean) => {
    if (!effectiveUser || !lessonId) return;
    
    const key = `ek_practice_checks:${effectiveUser.id}:${lessonId}`;
    const newState = { ...practiceChecked, [`item-${index}`]: checked };
    setPracticeChecked(newState);
    localStorage.setItem(key, JSON.stringify(newState));
    toast.success(checked ? 'Пункт выполнен!' : 'Отметка снята');
  };

  const handleMarkVideoWatched = () => {
    if (!effectiveUser) return;
    setVideoWatched(true);
    updateLessonProgress(effectiveUser.id, currentLesson.id, program.id, {
      videoWatched: true,
      percent: hasPractice ? 80 : 100,
    });
    toast.success('Видео отмечено как просмотренное');
  };

  const handleAcknowledge = () => {
    if (!effectiveUser) return;
    setAcknowledged(true);
    updateLessonProgress(effectiveUser.id, currentLesson.id, program.id, {
      acknowledged: true,
      percent: 100,
    });
    toast.success('Урок завершён');
  };

  const handleSubmitPractice = () => {
    if (!effectiveUser || !practiceContent.trim()) return;
    addSubmission({
      userId: effectiveUser.id,
      programId: program.id,
      lessonId: currentLesson.id,
      content: practiceContent,
    });
    setPracticeContent('');
    toast.success('Практика отправлена!');
    window.location.reload();
  };

  const renderBlock = (block: LessonBlock) => {
    switch (block.type) {
      case 'video':
        return (
          <div key={block.id} className="mb-8">
            <div className="aspect-video bg-muted rounded-xl flex items-center justify-center border border-border">
              <div className="text-center">
                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Kinescope Player</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {block.content?.kinescopeId || 'не указан'}</p>
              </div>
            </div>
            {!progress?.videoWatched && !videoWatched && (
              <Button onClick={handleMarkVideoWatched} className="mt-4 bg-gold hover:bg-gold-dark text-primary-foreground gap-2">
                <CheckCircle className="w-4 h-4" /> Отметить видео просмотренным
              </Button>
            )}
            {(progress?.videoWatched || videoWatched) && (
              <div className="mt-4 flex items-center gap-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Видео просмотрено</span>
              </div>
            )}
          </div>
        );
      case 'richtext':
        return <div key={block.id} className="prose prose-sm max-w-none mb-8 text-foreground" dangerouslySetInnerHTML={{ __html: block.content }} />;
      case 'image':
        return <div key={block.id} className="mb-8"><img src={block.content?.url || block.content} alt="" className="rounded-xl max-w-full" /></div>;
      case 'audio':
        return (
          <div key={block.id} className="mb-8 p-6 bg-muted rounded-xl flex items-center gap-4">
            <Button size="icon" className="rounded-full bg-gold hover:bg-gold-dark"><Play className="w-4 h-4" /></Button>
            <div>
              <p className="text-foreground">{block.content?.title || 'Аудио-практика'}</p>
              <p className="text-xs text-muted-foreground">{block.content?.url || ''}</p>
            </div>
          </div>
        );
      case 'divider':
        return <hr key={block.id} className="my-8 border-border" />;
      case 'callout':
        return (
          <div key={block.id} className="mb-8 p-4 bg-gold/10 border border-gold/30 rounded-xl">
            <p className="text-foreground">{block.content}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const NavigationButtons = () => (
    <div className="flex items-center gap-4">
      {prevLessonId ? (
        <Button asChild variant="outline" className="gap-2 flex-1 justify-center border-gold/30 text-gold hover:bg-gold/10">
          <Link to={`/app/programs/${programId}/lessons/${prevLessonId}`}>
            <ArrowLeft className="w-4 h-4" /> Назад
          </Link>
        </Button>
      ) : <div className="flex-1" />}
      
      {nextLessonId ? (
        <Button asChild className="gap-2 flex-1 justify-center bg-gold hover:bg-gold-dark text-primary-foreground">
          <Link to={`/app/programs/${programId}/lessons/${nextLessonId}`}>
            Дальше <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      ) : (
        <Button asChild variant="outline" className="flex-1 justify-center">
          <Link to={`/app/programs/${programId}`}>К программе</Link>
        </Button>
      )}
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600">
            <CheckCircle className="w-3 h-3" /> Принято
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive">
            <AlertCircle className="w-3 h-3" /> На доработку
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gold/20 text-gold">
            <Clock className="w-3 h-3" /> На проверке
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link to={`/app/programs/${programId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Назад к программе</span>
        </Link>

        <Collapsible open={showStructure} onOpenChange={setShowStructure}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
            <h1 className="font-display text-xl text-foreground text-left">{program.title}</h1>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showStructure ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Lesson title with favorite */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl text-foreground">{currentLesson.title}</h2>
        <Button variant="ghost" size="icon" onClick={() => toggleFavorite(currentLesson.id)}>
          <Star className={`w-5 h-5 ${isFavorite ? 'text-gold fill-gold' : 'text-muted-foreground'}`} />
        </Button>
      </div>

      {currentLesson.description && (
        <p className="text-muted-foreground mb-4">{currentLesson.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <LessonProgress percent={currentPercent} />
      </div>

      {/* Top Navigation */}
      <NavigationButtons />

      {/* Content */}
      <div className="my-8">
        {currentLesson.blocks
          .sort((a, b) => a.order - b.order)
          .map(block => renderBlock(block))}

        {/* Materials/Attachments */}
        {currentLesson.attachments && currentLesson.attachments.length > 0 && (
          <div className="mb-8 p-6 bg-muted/50 rounded-xl">
            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Материалы к уроку
            </h3>
            <div className="space-y-2">
              {currentLesson.attachments.map(att => (
                <a 
                  key={att.id} 
                  href={att.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-background rounded-lg hover:bg-muted transition-colors"
                >
                  <Download className="w-4 h-4 text-gold" />
                  <span className="text-sm">{att.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tasks with Checkboxes Section */}
        {hasTasks && (
          <div className="mb-8 p-6 border border-gold/30 rounded-xl bg-gold/5">
            <h3 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gold" />
              Задания
            </h3>
            <div className="space-y-3">
              {(currentLesson.tasks ?? []).map(task => {
                const isChecked = taskStates[task.id] || false;
                return (
                  <div 
                    key={task.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      isChecked ? 'bg-green-500/10 border border-green-500/30' : 'bg-background border border-border'
                    }`}
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleTaskToggle(task.id, checked === true)}
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor={`task-${task.id}`}
                      className={`cursor-pointer flex-1 ${isChecked ? 'text-green-700 line-through' : 'text-foreground'}`}
                    >
                      {task.title}
                    </Label>
                    {isChecked && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Show progress */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Выполнено: {Object.values(taskStates).filter(Boolean).length} из {(currentLesson.tasks ?? []).length}
              </p>
            </div>
          </div>
        )}

        {/* Practice section */}
        {hasPractice && (
          <div className="mb-8 p-6 border border-gold/30 rounded-xl bg-gold/5">
            <h3 className="font-display text-lg text-foreground mb-2">
              {currentLesson.practice?.title || 'Практика'}
            </h3>
            {currentLesson.practice?.description && (
              <p className="text-muted-foreground mb-4">{currentLesson.practice.description}</p>
            )}

            {/* Checkbox Practice Type */}
            {hasCheckboxPractice && checkboxPracticeItems.length > 0 && (
              <div className="space-y-3 mb-6">
                {checkboxPracticeItems.map((item, index) => {
                  const isChecked = practiceChecked[`item-${index}`] || false;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                        isChecked ? 'bg-green-500/10 border border-green-500/30' : 'bg-background border border-border'
                      }`}
                    >
                      <Checkbox
                        id={`practice-${index}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => handlePracticeCheck(index, checked === true)}
                        className="mt-0.5"
                      />
                      <Label 
                        htmlFor={`practice-${index}`}
                        className={`cursor-pointer flex-1 ${isChecked ? 'text-green-700 line-through' : 'text-foreground'}`}
                      >
                        {item}
                      </Label>
                      {isChecked && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
                
                {/* Progress for checkbox practice */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Выполнено: {Object.values(practiceChecked).filter(Boolean).length} из {checkboxPracticeItems.length}
                  </p>
                </div>
              </div>
            )}

            {/* Open Question Practice Type - Submission history */}
            {(!hasCheckboxPractice) && submissions.length > 0 && (
              <div className="mb-6 space-y-3">
                <h4 className="text-sm font-medium text-foreground">История ответов</h4>
                {submissions.map(sub => (
                  <div key={sub.id} className="p-4 bg-background rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{sub.createdAt}</span>
                      {getStatusBadge(sub.status)}
                    </div>
                    <p className="text-sm text-foreground">{sub.content}</p>
                    {sub.adminReply && (
                      <div className="mt-3 p-3 bg-gold/10 rounded-lg border-l-2 border-gold">
                        <p className="text-xs text-muted-foreground mb-1">Ответ наставницы:</p>
                        <p className="text-sm text-foreground">{sub.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New submission for open question - show if can submit again */}
            {!hasCheckboxPractice && canSubmitAgain && (
              <div className="space-y-3">
                {lastSubmission?.status === 'rejected' && (
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 mb-4">
                    <p className="text-sm text-foreground">
                      Пожалуйста, учтите замечания наставницы и отправьте исправленный ответ.
                    </p>
                  </div>
                )}
                <Textarea 
                  value={practiceContent}
                  onChange={(e) => setPracticeContent(e.target.value)}
                  placeholder="Напишите ваш ответ..."
                  rows={4}
                />
                <Button 
                  onClick={handleSubmitPractice}
                  disabled={!practiceContent.trim()}
                  className="bg-gold hover:bg-gold-dark text-primary-foreground gap-2"
                >
                  <Send className="w-4 h-4" /> 
                  {lastSubmission ? 'Отправить повторно' : 'Отправить'}
                </Button>
              </div>
            )}

            {/* Show message if waiting for review - only for open question */}
            {!hasCheckboxPractice && lastSubmission?.status === 'submitted' && (
              <div className="p-4 bg-gold/10 rounded-lg border border-gold/20">
                <div className="flex items-center gap-2 text-gold">
                  <Clock className="w-5 h-5" />
                  <p className="font-medium">Ваш ответ отправлен на проверку</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Наставница скоро проверит вашу работу и даст обратную связь.
                </p>
              </div>
            )}

            {/* Show success if approved - only for open question */}
            {!hasCheckboxPractice && lastSubmission?.status === 'approved' && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">Задание принято!</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Acknowledge checkbox for lessons without video/practice */}
        {!hasVideo && !hasPractice && !progress?.acknowledged && !acknowledged && (
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Checkbox id="acknowledge" checked={acknowledged} onCheckedChange={(checked) => { if (checked) handleAcknowledge(); }} />
            <Label htmlFor="acknowledge" className="cursor-pointer">С уроком ознакомилась</Label>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <NavigationButtons />
    </div>
  );
}
