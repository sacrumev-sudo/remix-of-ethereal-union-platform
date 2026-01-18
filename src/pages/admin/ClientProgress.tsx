import { useParams, Link } from 'react-router-dom';
import { getUserById, getProgramById, getUserProgress, getSubmissions, getLessonById, getAllLessonIdsFromOutline } from '@/lib/storage';
import { formatDateRu } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Circle, Clock, FileText, Video, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function ClientProgress() {
  const { userId, programId } = useParams<{ userId: string; programId: string }>();
  
  const user = userId ? getUserById(userId) : null;
  const program = programId ? getProgramById(programId) : null;
  const userProgress = userId ? getUserProgress(userId) : [];
  const submissions = getSubmissions().filter(s => s.userId === userId && s.programId === programId);
  
  if (!user || !program) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Данные не найдены</p>
        <Link to="/admin/finance" className="text-gold hover:underline mt-4 inline-block">
          Вернуться к финансам
        </Link>
      </div>
    );
  }

  // Get all lesson IDs from program outline
  const lessonIds = getAllLessonIdsFromOutline(program.outline);
  
  // Calculate overall progress
  const lessonsWithProgress = lessonIds.map(lessonId => {
    const lesson = getLessonById(lessonId);
    const progress = userProgress.find(p => p.lessonId === lessonId);
    const lessonSubmissions = submissions.filter(s => s.lessonId === lessonId);
    
    return {
      lesson,
      progress,
      submissions: lessonSubmissions,
    };
  }).filter(l => l.lesson);

  const completedCount = lessonsWithProgress.filter(l => l.progress?.percent === 100).length;
  const overallProgress = lessonIds.length > 0 
    ? Math.round((completedCount / lessonIds.length) * 100) 
    : 0;

  const statsData = {
    totalLessons: lessonIds.length,
    completed: completedCount,
    inProgress: lessonsWithProgress.filter(l => l.progress && l.progress.percent > 0 && l.progress.percent < 100).length,
    notStarted: lessonsWithProgress.filter(l => !l.progress || l.progress.percent === 0).length,
    submittedHomework: submissions.filter(s => s.status === 'submitted').length,
    approvedHomework: submissions.filter(s => s.status === 'approved').length,
    rejectedHomework: submissions.filter(s => s.status === 'rejected').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/finance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
      </div>

      {/* User & Program Info */}
      <div className="premium-card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-foreground">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Программа</p>
            <p className="font-medium text-gold">{program.title}</p>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="premium-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Общий прогресс</h2>
          <span className="text-2xl font-bold text-gold">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-2xl font-bold text-foreground">{statsData.totalLessons}</p>
            <p className="text-xs text-muted-foreground">Всего уроков</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <p className="text-2xl font-bold text-green-500">{statsData.completed}</p>
            <p className="text-xs text-muted-foreground">Завершено</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-500/10">
            <p className="text-2xl font-bold text-orange-500">{statsData.inProgress}</p>
            <p className="text-xs text-muted-foreground">В процессе</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-muted-foreground">{statsData.notStarted}</p>
            <p className="text-xs text-muted-foreground">Не начато</p>
          </div>
        </div>
      </div>

      {/* Homework Stats */}
      <div className="premium-card mb-6">
        <h2 className="font-display text-lg mb-4">Домашние задания</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-blue-500/10">
            <p className="text-xl font-bold text-blue-500">{statsData.submittedHomework}</p>
            <p className="text-xs text-muted-foreground">На проверке</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10">
            <p className="text-xl font-bold text-green-500">{statsData.approvedHomework}</p>
            <p className="text-xs text-muted-foreground">Принято</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10">
            <p className="text-xl font-bold text-red-500">{statsData.rejectedHomework}</p>
            <p className="text-xs text-muted-foreground">На доработку</p>
          </div>
        </div>
      </div>

      {/* Lessons Table */}
      <div className="premium-card p-0 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg">Детализация по урокам</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground">Урок</th>
                <th className="text-center py-3 px-4 text-muted-foreground">
                  <Video className="w-4 h-4 inline mr-1" />
                  Видео
                </th>
                <th className="text-center py-3 px-4 text-muted-foreground">
                  <FileText className="w-4 h-4 inline mr-1" />
                  ДЗ сдано
                </th>
                <th className="text-center py-3 px-4 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  ДЗ принято
                </th>
                <th className="text-center py-3 px-4 text-muted-foreground">Прогресс</th>
              </tr>
            </thead>
            <tbody>
              {lessonsWithProgress.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Уроки не найдены
                  </td>
                </tr>
              ) : (
                lessonsWithProgress.map(({ lesson, progress, submissions: lessonSubs }) => {
                  const percent = progress?.percent || 0;
                  const latestSubmission = lessonSubs[lessonSubs.length - 1];
                  
                  return (
                    <tr key={lesson!.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium">{lesson!.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {progress?.videoWatched ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {progress?.homeworkSubmitted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {progress?.homeworkApproved ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : latestSubmission?.status === 'rejected' ? (
                          <span className="text-xs text-red-500">На доработку</span>
                        ) : latestSubmission?.status === 'submitted' ? (
                          <Clock className="w-5 h-5 text-orange-500 mx-auto" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Progress value={percent} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-10 text-right">{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Submissions */}
      {submissions.length > 0 && (
        <div className="premium-card mt-6">
          <h2 className="font-display text-lg mb-4">Последние сданные работы</h2>
          <div className="space-y-3">
            {submissions.slice(-5).reverse().map(sub => {
              const lesson = getLessonById(sub.lessonId);
              return (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{lesson?.title || 'Урок'}</p>
                    <p className="text-xs text-muted-foreground">{formatDateRu(sub.createdAt)}</p>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    sub.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                    sub.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    {sub.status === 'approved' ? 'Принято' :
                     sub.status === 'rejected' ? 'На доработку' : 'На проверке'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
