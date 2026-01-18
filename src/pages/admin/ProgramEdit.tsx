import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  getProgramById, 
  updateProgram, 
  getLessonById,
  updateLesson,
  addSection,
  addSubsection,
  deleteOutlineNode,
  updateOutlineNodeTitle,
} from '@/lib/storage';
import { Program, Lesson, OutlineNode, OutlineSectionNode, OutlineLessonNode } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Plus, 
  Eye, 
  Trash2, 
  Edit3,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Folder,
  FolderOpen,
  FileText,
  Save,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import SearchInput from '@/components/SearchInput';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminProgramEdit() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  
  // Removed modal state - now using full page editor

  useEffect(() => {
    if (programId) {
      const p = getProgramById(programId);
      if (p) {
        setProgram(p);
        // Expand all sections by default
        const allIds = collectNodeIds(p.outline);
        setExpandedNodes(allIds);
      }
    }
  }, [programId]);

  // Listen for storage events to auto-update when lessons are saved
  useEffect(() => {
    const handleStorageChange = () => {
      if (programId) {
        const p = getProgramById(programId);
        if (p) setProgram(p);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [programId]);

  const collectNodeIds = (nodes?: OutlineNode[]): string[] => {
    if (!nodes || !Array.isArray(nodes)) return [];
    const ids: string[] = [];
    nodes.forEach(n => {
      if (n.type !== 'lesson') {
        ids.push(n.id);
        const sectionNode = n as OutlineSectionNode;
        ids.push(...collectNodeIds(sectionNode.children ?? []));
      }
    });
    return ids;
  };

  const reloadProgram = () => {
    if (programId) {
      const p = getProgramById(programId);
      if (p) setProgram(p);
    }
  };

  if (!program) return <div className="p-8 text-center">Программа не найдена</div>;

  const saveProgram = (updates: Partial<Program>) => {
    updateProgram(program.id, updates);
    reloadProgram();
    toast.success('Изменения сохранены');
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev =>
      prev.includes(nodeId)
        ? prev.filter(id => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const handleAddSection = (parentId?: string) => {
    const newSection = addSection(program.id, parentId);
    reloadProgram();
    if (newSection) {
      setEditingNodeId(newSection.id);
    }
    toast.success('Раздел добавлен');
  };

  const handleAddSubsection = (sectionId: string) => {
    addSubsection(program.id, sectionId);
    reloadProgram();
    toast.success('Подраздел добавлен');
  };

  // Navigate to full lesson editor page instead of opening modal
  const openAddLesson = (parentId?: string) => {
    // Store parentId in sessionStorage to use when creating lesson
    if (parentId) {
      sessionStorage.setItem('lessonParentId', parentId);
    } else {
      sessionStorage.removeItem('lessonParentId');
    }
    navigate(`/admin/programs/${programId}/lessons/new`);
  };

  // Lesson creation is now handled in LessonEdit page

  const handleDeleteNode = (nodeId: string) => {
    if (confirm('Удалить этот элемент?')) {
      deleteOutlineNode(program.id, nodeId);
      reloadProgram();
      toast.success('Удалено');
    }
  };

  const handleRenameNode = (nodeId: string, title: string) => {
    updateOutlineNodeTitle(program.id, nodeId, title);
    reloadProgram();
    setEditingNodeId(null);
  };

  const handleSaveLesson = (lessonId: string, updates: Partial<Lesson>) => {
    updateLesson(lessonId, updates);
    reloadProgram();
    toast.success('Урок сохранён');
  };

  // Filter nodes by search
  const matchesSearch = (node: OutlineNode): boolean => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (node.title.toLowerCase().includes(query)) return true;
    if (node.type !== 'lesson') {
      const sectionNode = node as OutlineSectionNode;
      return (sectionNode.children ?? []).some(matchesSearch);
    }
    return false;
  };

  const renderOutlineNode = (node: OutlineNode, depth: number = 0): React.ReactNode => {
    if (!matchesSearch(node)) return null;
    
    const isExpanded = expandedNodes.includes(node.id);
    const isEditing = editingNodeId === node.id;
    const paddingLeft = depth * 24;

    if (node.type === 'lesson') {
      const lessonNode = node as OutlineLessonNode;
      const lesson = getLessonById(lessonNode.lessonId);
      const isLessonEditing = editingLessonId === lessonNode.lessonId;

      return (
        <div key={node.id}>
          <div 
            className="flex items-center gap-2 p-3 hover:bg-muted/50 rounded-lg transition-colors group"
            style={{ paddingLeft: paddingLeft + 12 }}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
            <FileText className="w-4 h-4 text-gold" />
            
            {isEditing ? (
              <Input
                value={node.title}
                onChange={(e) => handleRenameNode(node.id, e.target.value)}
                onBlur={() => setEditingNodeId(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingNodeId(null)}
                autoFocus
                className="flex-1 h-8"
              />
            ) : (
              <span className="flex-1 text-sm text-foreground">{node.title}</span>
            )}
            
            {lesson?.practice?.enabled && (
              <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold rounded">Практика</span>
            )}
            {lesson?.stopLessonMode !== 'none' && (
              <span className="text-xs px-2 py-0.5 bg-destructive/20 text-destructive rounded">
                Стоп
              </span>
            )}

            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={() => navigate(`/admin/programs/${programId}/lessons/${lessonNode.lessonId}/edit`)}>
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
              onClick={() => handleDeleteNode(node.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Inline lesson editor */}
          {isLessonEditing && lesson && (
            <div className="ml-8 mr-4 mb-4 p-4 border border-border rounded-xl bg-background space-y-4">
              <div>
                <Label>Название</Label>
                <Input 
                  value={lesson.title} 
                  onChange={(e) => handleSaveLesson(lesson.id, { title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea 
                  value={lesson.description || ''} 
                  onChange={(e) => handleSaveLesson(lesson.id, { description: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={lesson.practice?.enabled || false}
                    onCheckedChange={(checked) => handleSaveLesson(lesson.id, { 
                      practice: { enabled: checked, title: 'Практика', required: false }
                    })}
                  />
                  <Label>Практика</Label>
                </div>
                <div className="flex-1">
                  <Select 
                    value={lesson.stopLessonMode} 
                    onValueChange={(v: 'none' | 'auto' | 'manual') => handleSaveLesson(lesson.id, { stopLessonMode: v })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без ограничений</SelectItem>
                      <SelectItem value="auto">Авто-стоп</SelectItem>
                      <SelectItem value="manual">Ручной стоп</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditingLessonId(null)}>
                Закрыть редактор
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Section or Subsection
    const sectionNode = node as OutlineSectionNode;
    const Icon = node.type === 'section' ? (isExpanded ? FolderOpen : Folder) : BookOpen;

    return (
      <div key={node.id}>
        <div 
          className="flex items-center gap-2 p-3 hover:bg-muted/50 rounded-lg transition-colors group cursor-pointer"
          style={{ paddingLeft: paddingLeft + 12 }}
          onClick={() => toggleNode(node.id)}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <Icon className="w-4 h-4 text-muted-foreground" />
          
          {isEditing ? (
            <Input
              value={node.title}
              onChange={(e) => handleRenameNode(node.id, e.target.value)}
              onBlur={() => setEditingNodeId(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingNodeId(null)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className="flex-1 h-8"
            />
          ) : (
            <span className="flex-1 font-medium text-foreground">{node.title}</span>
          )}

          <span className="text-xs text-muted-foreground">
            {(sectionNode.children ?? []).length} элементов
          </span>

          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); setEditingNodeId(node.id); }}>
            <Edit3 className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
            onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {isExpanded && (
          <div>
            {(sectionNode.children ?? [])
              .sort((a, b) => a.order - b.order)
              .map(child => renderOutlineNode(child, depth + 1))}
            
            {/* Add buttons inside section */}
            <div className="flex gap-2 py-2" style={{ paddingLeft: paddingLeft + 36 }}>
              {node.type === 'section' && (
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleAddSubsection(node.id)}>
                  <Plus className="w-3 h-3 mr-1" /> Подраздел
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openAddLesson(node.id)}>
                <Plus className="w-3 h-3 mr-1" /> Урок
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Link to="/admin/programs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Программы
      </Link>

      <div className="flex items-start justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Редактирование: {program.title}</h1>
        <Button variant="outline" className="gap-2">
          <Eye className="w-4 h-4" /> Предпросмотр
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content - Outline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card">
            <h3 className="font-medium mb-4">Основная информация</h3>
            <div className="space-y-4">
              <div>
                <Label>Название программы</Label>
                <Input 
                  value={program.title}
                  onChange={(e) => setProgram({ ...program, title: e.target.value })}
                  className="mt-1" 
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea 
                  value={program.description}
                  onChange={(e) => setProgram({ ...program, description: e.target.value })}
                  className="mt-1" 
                  rows={3} 
                />
              </div>
              <Button 
                onClick={() => saveProgram({ title: program.title, description: program.description })}
                className="bg-gold hover:bg-gold-dark text-primary-foreground gap-2"
              >
                <Save className="w-4 h-4" /> Сохранить
              </Button>
            </div>
          </div>

          {/* Outline Tree */}
          <div className="premium-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Оглавление программы</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleAddSection()}>
                  <Plus className="w-4 h-4 mr-1" /> Раздел
                </Button>
                <Button size="sm" variant="outline" onClick={() => openAddLesson()}>
                  <Plus className="w-4 h-4 mr-1" /> Урок
                </Button>
              </div>
            </div>

            <SearchInput 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Поиск по урокам..."
              className="mb-4"
            />

            <div className="space-y-1">
              {(program.outline ?? []).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Нажмите "Раздел" или "Урок" чтобы начать
                </p>
              ) : (
                (program.outline ?? [])
                  .sort((a, b) => a.order - b.order)
                  .map(node => renderOutlineNode(node))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="premium-card">
            <h3 className="font-medium mb-4">Статус</h3>
            <Select 
              value={program.status} 
              onValueChange={(v: 'published' | 'hidden') => saveProgram({ status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Опубликовано</SelectItem>
                <SelectItem value="hidden">Скрыто</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lesson Dialog removed - now using full page editor */}
    </div>
  );
}
