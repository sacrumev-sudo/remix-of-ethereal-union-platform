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
  addLessonToOutline,
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
  X,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function AdminProgramEdit() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  
  // Drawer state for inline lesson editing
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonHasHomework, setLessonHasHomework] = useState(false);
  const [lessonStopMode, setLessonStopMode] = useState<'none' | 'auto' | 'manual'>('none');
  
  // New lesson creation in drawer
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [newLessonParentId, setNewLessonParentId] = useState<string | undefined>();

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

  if (!program) return <div className="p-8 text-center text-muted-foreground">Программа не найдена</div>;

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

  // Open drawer for creating new lesson
  const openNewLessonDrawer = (parentId?: string) => {
    setIsCreatingLesson(true);
    setNewLessonParentId(parentId);
    setEditingLesson(null);
    setLessonTitle('');
    setLessonDescription('');
    setLessonContent('');
    setLessonHasHomework(false);
    setLessonStopMode('none');
    setDrawerOpen(true);
  };

  // Open drawer for editing existing lesson
  const openEditLessonDrawer = (lessonId: string) => {
    const lesson = getLessonById(lessonId);
    if (lesson) {
      setIsCreatingLesson(false);
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDescription(lesson.description || '');
      
      // Extract content from blocks
      const richtextBlock = lesson.blocks?.find(b => b.type === 'richtext');
      setLessonContent(richtextBlock?.content || '');
      
      setLessonHasHomework(lesson.practice?.enabled || false);
      setLessonStopMode(lesson.stopLessonMode || 'none');
      setDrawerOpen(true);
    }
  };

  // Save lesson from drawer
  const handleSaveLessonFromDrawer = () => {
    if (!lessonTitle.trim()) {
      toast.error('Введите название урока');
      return;
    }

    const cleanContent = lessonContent.replace(/<p><\/p>/g, '').trim();
    
    const lessonData: Partial<Lesson> = {
      title: lessonTitle.trim(),
      description: lessonDescription.trim() || undefined,
      published: true,
      stopLessonMode: lessonStopMode,
      blocks: [
        { id: `block-${Date.now()}`, type: 'richtext', order: 1, content: cleanContent || '' },
      ],
      practice: lessonHasHomework ? {
        enabled: true,
        title: 'Домашнее задание',
        description: '',
        required: lessonStopMode !== 'none',
      } : undefined,
    };

    if (isCreatingLesson) {
      // Create new lesson
      const newLesson = addLessonToOutline(program.id, newLessonParentId, lessonData);
      if (newLesson) {
        toast.success('Урок создан');
        reloadProgram();
        setDrawerOpen(false);
      } else {
        toast.error('Не удалось создать урок');
      }
    } else if (editingLesson) {
      // Update existing lesson
      updateLesson(editingLesson.id, lessonData);
      toast.success('Урок сохранён');
      reloadProgram();
      setDrawerOpen(false);
    }

    window.dispatchEvent(new Event('storage'));
  };

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

      return (
        <div key={node.id}>
          <div 
            className="flex items-center gap-2 p-3 hover:bg-muted/50 rounded-xl transition-colors group"
            style={{ paddingLeft: paddingLeft + 12 }}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
            <FileText className="w-4 h-4 text-primary" />
            
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
              <span 
                className="flex-1 text-sm text-foreground cursor-pointer hover:text-primary transition-colors"
                onClick={() => openEditLessonDrawer(lessonNode.lessonId)}
              >
                {node.title}
              </span>
            )}
            
            {lesson?.practice?.enabled && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">Практика</span>
            )}
            {lesson?.stopLessonMode !== 'none' && (
              <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                Стоп
              </span>
            )}

            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={() => openEditLessonDrawer(lessonNode.lessonId)}>
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
              onClick={() => handleDeleteNode(node.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      );
    }

    // Section or Subsection
    const sectionNode = node as OutlineSectionNode;
    const Icon = node.type === 'section' ? (isExpanded ? FolderOpen : Folder) : BookOpen;

    return (
      <div key={node.id}>
        <div 
          className="flex items-center gap-2 p-3 hover:bg-muted/50 rounded-xl transition-colors group cursor-pointer"
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
                <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => handleAddSubsection(node.id)}>
                  <Plus className="w-3 h-3 mr-1" /> Подраздел
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => openNewLessonDrawer(node.id)}>
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
      <Link to="/admin/programs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Программы
      </Link>

      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-foreground mb-2">Редактирование программы</h1>
          <p className="text-muted-foreground">Настройте информацию и структуру курса</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Eye className="w-4 h-4" /> Предпросмотр
        </Button>
      </div>

      {/* Single unified card with program info + structure */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Program Info Section */}
        <div className="p-6 border-b border-border">
          <h3 className="font-display text-lg mb-4 text-foreground">Основная информация</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-muted-foreground">Название программы</Label>
              <Input 
                value={program.title}
                onChange={(e) => setProgram({ ...program, title: e.target.value })}
                className="mt-1.5 bg-background" 
                placeholder="Введите название..."
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Статус</Label>
              <Select 
                value={program.status} 
                onValueChange={(v: 'published' | 'hidden') => saveProgram({ status: v })}
              >
                <SelectTrigger className="mt-1.5 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Опубликовано</SelectItem>
                  <SelectItem value="hidden">Скрыто</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm text-muted-foreground">Описание</Label>
              <Textarea 
                value={program.description}
                onChange={(e) => setProgram({ ...program, description: e.target.value })}
                className="mt-1.5 bg-background" 
                rows={3} 
                placeholder="Краткое описание программы..."
              />
            </div>
          </div>
          <Button 
            onClick={() => saveProgram({ title: program.title, description: program.description })}
            className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Save className="w-4 h-4" /> Сохранить информацию
          </Button>
        </div>

        {/* Structure Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-foreground">Структура программы</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleAddSection()} className="gap-1">
                <Plus className="w-4 h-4" /> Раздел
              </Button>
              <Button size="sm" variant="outline" onClick={() => openNewLessonDrawer()} className="gap-1">
                <Plus className="w-4 h-4" /> Урок
              </Button>
            </div>
          </div>

          <SearchInput 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Поиск по урокам..."
            className="mb-4"
          />

          <div className="space-y-1 min-h-[200px]">
            {(program.outline ?? []).length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Структура пуста. Добавьте разделы и уроки.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={() => handleAddSection()}>
                    <Plus className="w-4 h-4 mr-1" /> Раздел
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openNewLessonDrawer()}>
                    <Plus className="w-4 h-4 mr-1" /> Урок
                  </Button>
                </div>
              </div>
            ) : (
              (program.outline ?? [])
                .sort((a, b) => a.order - b.order)
                .map(node => renderOutlineNode(node))
            )}
          </div>
        </div>
      </div>

      {/* Lesson Editor Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="font-display text-xl">
              {isCreatingLesson ? 'Новый урок' : 'Редактирование урока'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <Label className="text-sm text-muted-foreground">Название урока</Label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Название урока"
                className="mt-1.5 text-lg"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm text-muted-foreground">Краткое описание</Label>
              <Textarea
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Описание урока..."
                className="mt-1.5"
                rows={2}
              />
            </div>

            {/* Content Editor */}
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Контент урока</Label>
              <RichTextEditor
                content={lessonContent}
                onChange={setLessonContent}
                placeholder="Начните писать контент урока..."
                minHeight="300px"
              />
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Домашнее задание</Label>
                <Switch
                  checked={lessonHasHomework}
                  onCheckedChange={setLessonHasHomework}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Режим стоп-урока</Label>
                <Select 
                  value={lessonStopMode} 
                  onValueChange={(v: 'none' | 'auto' | 'manual') => setLessonStopMode(v)}
                >
                  <SelectTrigger className="bg-background">
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                onClick={handleSaveLessonFromDrawer}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Save className="w-4 h-4" />
                {isCreatingLesson ? 'Создать урок' : 'Сохранить урок'}
              </Button>
              <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                Отмена
              </Button>
            </div>

            {/* Link to full editor for advanced options */}
            {!isCreatingLesson && editingLesson && (
              <div className="text-center pt-2">
                <Button
                  variant="link"
                  className="text-muted-foreground text-sm"
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate(`/admin/programs/${programId}/lessons/${editingLesson.id}/edit`);
                  }}
                >
                  Открыть расширенный редактор →
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
