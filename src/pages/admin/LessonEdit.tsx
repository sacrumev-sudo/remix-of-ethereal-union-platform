import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  getLessonById, 
  updateLesson, 
  getProgramById,
  addLessonToOutline,
} from '@/lib/storage';
import { Lesson } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Eye, ClipboardList, Calendar, HelpCircle, CheckSquare, FileDown, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import LessonPreviewModal from '@/components/admin/LessonPreviewModal';
import QuizEditor, { QuizQuestion } from '@/components/admin/QuizEditor';
import ChecklistEditor, { ChecklistItem } from '@/components/admin/ChecklistEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminLessonEdit() {
  const { programId, lessonId } = useParams();
  const navigate = useNavigate();
  const isNewLesson = lessonId === 'new';

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [programTitle, setProgramTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [hasHomework, setHasHomework] = useState(false);
  const [stopMode, setStopMode] = useState<'none' | 'auto' | 'manual'>('none');
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Schedule
  const [showSchedule, setShowSchedule] = useState(false);
  const [accessStartDate, setAccessStartDate] = useState('');
  const [accessEndDate, setAccessEndDate] = useState('');

  // Homework options
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [hasOpenQuestion, setHasOpenQuestion] = useState(true);
  const [openQuestionPrompt, setOpenQuestionPrompt] = useState('Напишите ваш ответ...');
  const [hasChecklist, setHasChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [summaryFileUrl, setSummaryFileUrl] = useState('');
  const [summaryFileName, setSummaryFileName] = useState('');
  
  // Checkbox practice (new)
  const [practiceType, setPracticeType] = useState<'open' | 'checkboxes'>('open');
  const [checkboxPracticeItems, setCheckboxPracticeItems] = useState<string[]>([]);

  useEffect(() => {
    if (programId) {
      const program = getProgramById(programId);
      if (program) {
        setProgramTitle(program.title);
      }
    }

    if (!isNewLesson && lessonId) {
      const existingLesson = getLessonById(lessonId);
      if (existingLesson) {
        setLesson(existingLesson);
        setTitle(existingLesson.title);
        setDescription(existingLesson.description || '');
        
        // Extract content from blocks
        const richtextBlock = existingLesson.blocks?.find(b => b.type === 'richtext');
        if (richtextBlock) {
          setContent(richtextBlock.content);
        }
        
        // Load practice/homework settings
        if (existingLesson.practice) {
          setHasHomework(existingLesson.practice.enabled);
          if (existingLesson.practice.type) {
            setPracticeType(existingLesson.practice.type);
          }
          if (existingLesson.practice.checkboxItems) {
            setCheckboxPracticeItems(existingLesson.practice.checkboxItems);
          }
        }
        
        // Load checklist items from tasks
        if (existingLesson.tasks && existingLesson.tasks.length > 0) {
          setHasChecklist(true);
          setChecklistItems(existingLesson.tasks.map((t, i) => ({
            id: t.id,
            text: t.title,
            order: t.order || i + 1,
          })));
        }
        
        setStopMode(existingLesson.stopLessonMode || 'none');
        setPublishImmediately(existingLesson.published);

        // Load schedule if exists
        if (existingLesson.accessStart || existingLesson.deadlineAt) {
          setShowSchedule(true);
          setAccessStartDate(existingLesson.accessStart || '');
          setAccessEndDate(existingLesson.deadlineAt || '');
        }
      }
    }
  }, [programId, lessonId, isNewLesson]);

  const handleSave = async () => {
    if (!programId) {
      toast.error('Программа не найдена');
      return;
    }

    if (!title.trim()) {
      toast.error('Введите название урока');
      return;
    }

    setIsSaving(true);

    try {
      // Clean content - don't save placeholder
      const cleanContent = content.replace(/<p><\/p>/g, '').trim();
      
      const lessonData: Partial<Lesson> = {
        title: title.trim(),
        description: description.trim() || undefined,
        published: publishImmediately,
        stopLessonMode: stopMode,
        accessStart: showSchedule && accessStartDate ? accessStartDate : undefined,
        deadlineAt: showSchedule && accessEndDate ? accessEndDate : undefined,
        blocks: [
          { id: `block-${Date.now()}`, type: 'richtext', order: 1, content: cleanContent || '' },
        ],
        practice: hasHomework ? {
          enabled: true,
          title: 'Домашнее задание',
          description: hasOpenQuestion ? openQuestionPrompt : '',
          required: stopMode !== 'none',
          type: practiceType,
          checkboxItems: practiceType === 'checkboxes' ? checkboxPracticeItems : undefined,
        } : undefined,
        // Save checklist tasks
        tasks: hasChecklist && (checklistItems ?? []).length > 0 
          ? (checklistItems ?? []).map((item, index) => ({
              id: item.id,
              title: item.text,
              order: index + 1,
            }))
          : undefined,
      };

      console.log('Saving lesson:', { programId, isNewLesson, lessonData });

      if (isNewLesson) {
        // Get parentId from sessionStorage (set by ProgramEdit)
        const parentId = sessionStorage.getItem('lessonParentId') || undefined;
        sessionStorage.removeItem('lessonParentId');
        
        // Create new lesson
        const newLesson = addLessonToOutline(programId, parentId, lessonData);
        console.log('New lesson created:', newLesson);
        
        if (newLesson) {
          // Trigger storage event for ProgramEdit to reload
          window.dispatchEvent(new Event('storage'));
          toast.success('Урок создан');
          navigate(`/admin/programs/${programId}/edit`);
        } else {
          toast.error('Не удалось создать урок');
        }
      } else if (lessonId) {
        // Update existing lesson
        updateLesson(lessonId, lessonData);
        // Trigger storage event for ProgramEdit to reload
        window.dispatchEvent(new Event('storage'));
        toast.success('Урок сохранён');
        navigate(`/admin/programs/${programId}/edit`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          to={`/admin/programs/${programId}/edit`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 
          {programTitle || 'Назад к программе'}
        </Link>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="w-4 h-4" /> Предпросмотр
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gold hover:bg-gold-dark text-primary-foreground"
          >
            <Save className="w-4 h-4" /> 
            {isSaving ? 'Сохранение...' : isNewLesson ? 'Создать урок' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <Label htmlFor="lesson-title" className="sr-only">Название урока</Label>
        <Input
          id="lesson-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название урока"
          className="text-2xl font-display h-14 border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-gold bg-transparent"
        />
      </div>

      {/* Main Content Editor - Large comfortable area */}
      <div className="mb-8">
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Начните писать контент урока... Используйте тулбар для форматирования, вставки изображений, видео и таблиц."
          minHeight="550px"
        />
      </div>

      {/* Schedule Section */}
      <div className="premium-card mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Расписание доступа</h3>
            <p className="text-sm text-muted-foreground">
              По умолчанию урок доступен сразу после открытия
            </p>
          </div>
          <Switch
            checked={showSchedule}
            onCheckedChange={setShowSchedule}
          />
        </div>

        {showSchedule && (
          <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t border-border">
            <div>
              <Label>Дата открытия доступа</Label>
              <Input
                type="date"
                value={accessStartDate}
                onChange={(e) => setAccessStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Дата закрытия доступа</Label>
              <Input
                type="date"
                value={accessEndDate}
                onChange={(e) => setAccessEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Homework Section - Expanded */}
      <div className="premium-card mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Домашнее задание</h3>
            <p className="text-sm text-muted-foreground">
              Настройте задания для проверки усвоения материала
            </p>
          </div>
          <Switch
            checked={hasHomework}
            onCheckedChange={setHasHomework}
          />
        </div>

        {hasHomework && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* Quiz Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  <Label>Опрос с выбором ответа</Label>
                </div>
                <Switch checked={hasQuiz} onCheckedChange={setHasQuiz} />
              </div>
              {hasQuiz && (
                <div className="ml-6">
                  <QuizEditor questions={quizQuestions} onChange={setQuizQuestions} />
                </div>
              )}
            </div>

            {/* Practice Type Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                <Label>Тип практического задания</Label>
              </div>
              <div className="ml-6 flex gap-4">
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${practiceType === 'open' ? 'border-gold bg-gold/10' : 'border-border'}`}>
                  <input
                    type="radio"
                    name="practiceType"
                    value="open"
                    checked={practiceType === 'open'}
                    onChange={() => setPracticeType('open')}
                    className="sr-only"
                  />
                  <span className="text-sm">Открытый вопрос</span>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${practiceType === 'checkboxes' ? 'border-gold bg-gold/10' : 'border-border'}`}>
                  <input
                    type="radio"
                    name="practiceType"
                    value="checkboxes"
                    checked={practiceType === 'checkboxes'}
                    onChange={() => setPracticeType('checkboxes')}
                    className="sr-only"
                  />
                  <span className="text-sm">Чекбоксы</span>
                </label>
              </div>
            </div>

            {/* Open Question (if selected) */}
            {practiceType === 'open' && (
              <div className="space-y-3 ml-6">
                <Label>Текст задания</Label>
                <Textarea
                  value={openQuestionPrompt}
                  onChange={(e) => setOpenQuestionPrompt(e.target.value)}
                  placeholder="Текст вопроса или задания..."
                  rows={2}
                />
              </div>
            )}

            {/* Checkbox Practice Items (if selected) */}
            {practiceType === 'checkboxes' && (
              <div className="space-y-3 ml-6">
                <Label>Пункты для выполнения</Label>
                <div className="space-y-2">
                  {checkboxPracticeItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-muted-foreground" />
                      <Input
                        value={item}
                        onChange={(e) => {
                          const updated = [...checkboxPracticeItems];
                          updated[index] = e.target.value;
                          setCheckboxPracticeItems(updated);
                        }}
                        placeholder={`Пункт ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          setCheckboxPracticeItems(checkboxPracticeItems.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCheckboxPracticeItems([...checkboxPracticeItems, ''])}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" /> Добавить пункт
                  </Button>
                </div>
              </div>
            )}

            {/* Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                  <Label>Чек-лист</Label>
                </div>
                <Switch checked={hasChecklist} onCheckedChange={setHasChecklist} />
              </div>
              {hasChecklist && (
                <div className="ml-6">
                  <ChecklistEditor items={checklistItems} onChange={setChecklistItems} />
                </div>
              )}
            </div>

            {/* Summary File */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-muted-foreground" />
                <Label>Конспект для скачивания</Label>
              </div>
              <div className="ml-6 flex gap-2">
                <Input
                  value={summaryFileUrl}
                  onChange={(e) => setSummaryFileUrl(e.target.value)}
                  placeholder="URL файла или ссылка..."
                  className="flex-1"
                />
                <Input
                  value={summaryFileName}
                  onChange={(e) => setSummaryFileName(e.target.value)}
                  placeholder="Название файла"
                  className="w-48"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stop Mode Settings */}
      <div className="premium-card mb-8">
        <h3 className="font-medium mb-3">Стоп-урок</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Ограничение доступа к следующим урокам
        </p>
        <Select value={stopMode} onValueChange={(v: 'none' | 'auto' | 'manual') => setStopMode(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Без ограничений</SelectItem>
            <SelectItem value="auto">Авто (после выполнения практики)</SelectItem>
            <SelectItem value="manual">Ручной (открываю сама)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Publish Settings */}
      <div className="premium-card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Опубликовать сразу</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Урок будет доступен студентам
            </p>
          </div>
          <Switch
            checked={publishImmediately}
            onCheckedChange={setPublishImmediately}
          />
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-center pb-8">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="gap-2 bg-gold hover:bg-gold-dark text-primary-foreground px-12"
        >
          <Save className="w-5 h-5" /> 
          {isSaving ? 'Сохранение...' : isNewLesson ? 'Создать урок' : 'Сохранить урок'}
        </Button>
      </div>

      {/* Preview Modal */}
      <LessonPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={title}
        description={description}
        content={content}
        hasHomework={hasHomework}
        attachments={[]}
      />
    </div>
  );
}
