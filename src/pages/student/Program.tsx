import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProgramById, getLessonById, getLessonProgress, getUserAccess, getAllLessonIdsFromOutline } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Lock, CheckCircle, Clock, ChevronDown, ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react';
import { OutlineNode, OutlineSectionNode, OutlineLessonNode, Lesson } from '@/data/mockData';
import { useState } from 'react';
import { formatDateRu } from '@/lib/utils';

export default function StudentProgram() {
  const { programId } = useParams();
  const { effectiveUser } = useAuth();
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  
  const program = programId ? getProgramById(programId) : null;
  
  if (!program) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="font-display text-2xl text-foreground mb-4">Программа не найдена</h1>
        <Button asChild variant="outline">
          <Link to="/app">← На главную</Link>
        </Button>
      </div>
    );
  }

  const userAccess = effectiveUser ? getUserAccess(effectiveUser.id) : [];
  const hasAccess = userAccess.some(a => a.programId === program.id);

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-2xl text-foreground mb-4">Нет доступа</h1>
        <p className="text-muted-foreground mb-6">У вас нет доступа к этой программе</p>
        <Button asChild variant="outline">
          <Link to="/app">← На главную</Link>
        </Button>
      </div>
    );
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev =>
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const getLessonStatus = (lesson: Lesson) => {
    if (!effectiveUser) return 'locked';
    const progress = getLessonProgress(effectiveUser.id, lesson.id);
    
    if (lesson.accessStart) {
      const startDate = new Date(lesson.accessStart);
      if (startDate > new Date()) return 'scheduled';
    }
    
    if (progress?.percent === 100) return 'completed';
    if (progress?.percent && progress.percent > 0) return 'in-progress';
    return 'available';
  };

  const renderOutlineNode = (node: OutlineNode, depth: number = 0): React.ReactNode => {
    const paddingLeft = depth * 24;

    if (node.type === 'lesson') {
      const lessonNode = node as OutlineLessonNode;
      const lesson = getLessonById(lessonNode.lessonId);
      if (!lesson || !lesson.published) return null;

      const status = getLessonStatus(lesson);
      const isAccessible = status !== 'locked' && status !== 'scheduled';
      const progress = effectiveUser ? getLessonProgress(effectiveUser.id, lesson.id) : null;

      return (
        <Link
          key={node.id}
          to={isAccessible ? `/app/programs/${program.id}/lessons/${lesson.id}` : '#'}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
            isAccessible 
              ? 'border-border hover:border-gold/50 hover:shadow-md cursor-pointer'
              : 'border-border/50 opacity-60 cursor-not-allowed'
          }`}
          style={{ marginLeft: paddingLeft }}
          onClick={(e) => !isAccessible && e.preventDefault()}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status === 'completed' ? 'bg-green-500/20' :
            status === 'in-progress' ? 'bg-gold/20' :
            status === 'scheduled' ? 'bg-muted' : 'bg-muted'
          }`}>
            {status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-500" /> :
             status === 'scheduled' ? <Clock className="w-5 h-5 text-muted-foreground" /> :
             status === 'locked' ? <Lock className="w-5 h-5 text-muted-foreground" /> :
             <Play className="w-5 h-5 text-gold" />}
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{lesson.title}</h4>
            {status === 'scheduled' && lesson.accessStart && (
              <p className="text-xs text-muted-foreground mt-1">
                Доступно с {formatDateRu(lesson.accessStart)}
              </p>
            )}
            {lesson.practice?.enabled && (
              <span className="text-xs text-gold">Есть практика</span>
            )}
          </div>

          {/* Progress hidden from student - shown only as bar */}
        </Link>
      );
    }

    // Section or Subsection
    const sectionNode = node as OutlineSectionNode;
    const isExpanded = expandedNodes.includes(node.id);
    const Icon = isExpanded ? FolderOpen : Folder;

    return (
      <div key={node.id} style={{ marginLeft: paddingLeft }}>
        <div 
          className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl cursor-pointer hover:bg-muted transition-colors mb-3"
          onClick={() => toggleNode(node.id)}
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <Icon className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium text-foreground flex-1">{node.title}</span>
          <span className="text-sm text-muted-foreground">
            {sectionNode.children.filter(c => c.type === 'lesson').length} уроков
          </span>
        </div>

        {isExpanded && (
          <div className="space-y-3 mb-4">
            {sectionNode.children
              .sort((a, b) => a.order - b.order)
              .map(child => renderOutlineNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Calculate progress
  const allLessonIds = getAllLessonIdsFromOutline(program.outline);
  const completedCount = allLessonIds.filter(id => {
    if (!effectiveUser) return false;
    const progress = getLessonProgress(effectiveUser.id, id);
    return progress?.percent === 100;
  }).length;
  const overallProgress = allLessonIds.length > 0 
    ? Math.round((completedCount / allLessonIds.length) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link to="/app" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Мои программы</span>
        </Link>

        <h1 className="font-display text-3xl text-foreground mb-2">{program.title}</h1>
        <p className="text-muted-foreground mb-6">{program.description}</p>

        <div className="premium-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Общий прогресс</span>
            <span className="text-sm font-medium text-foreground">
              {completedCount} / {allLessonIds.length} уроков
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      <div className="space-y-3">
        {program.outline.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Уроки пока не добавлены</p>
        ) : (
          program.outline
            .sort((a, b) => a.order - b.order)
            .map(node => renderOutlineNode(node))
        )}
      </div>
    </div>
  );
}
