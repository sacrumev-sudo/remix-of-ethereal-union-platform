import { LessonBlock } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Star,
  Send,
  FileText,
  Download,
  ArrowLeft,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  content: string;
  hasHomework: boolean;
  homeworkTitle?: string;
  attachments?: { id: string; title: string; url: string }[];
}

export default function LessonPreviewModal({
  open,
  onOpenChange,
  title,
  description,
  content,
  hasHomework,
  homeworkTitle = 'Домашнее задание',
  attachments = [],
}: LessonPreviewModalProps) {
  // Parse content to check for video blocks
  const hasVideo = content.includes('kinescope-video') || content.includes('data-kinescope-id');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium">
              Предпросмотр урока
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
                Режим студента
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 max-w-3xl mx-auto">
            {/* Header simulation */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 text-muted-foreground mb-4 text-sm">
                <ArrowLeft className="w-4 h-4" />
                <span>Назад к программе</span>
              </div>
            </div>

            {/* Lesson title with favorite */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-foreground">
                {title || 'Без названия'}
              </h2>
              <Button variant="ghost" size="icon" disabled>
                <Star className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            {description && (
              <p className="text-muted-foreground mb-4">{description}</p>
            )}

            {/* Progress bar simulation */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Прогресс урока</span>
                <span className="text-gold font-medium">0%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: '0%' }} />
              </div>
            </div>

            {/* Navigation buttons simulation */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" className="gap-2 flex-1 justify-center border-gold/30 text-gold hover:bg-gold/10" disabled>
                <ArrowLeft className="w-4 h-4" /> Назад
              </Button>
              <Button className="gap-2 flex-1 justify-center bg-gold hover:bg-gold-dark text-primary-foreground" disabled>
                Дальше <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="my-8">
              {/* Rich text content */}
              <div 
                className="lesson-preview-content mb-8"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              {/* Attachments/Materials */}
              {attachments.length > 0 && (
                <div className="mb-8 p-6 bg-muted/50 rounded-xl">
                  <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Материалы к уроку
                  </h3>
                  <div className="space-y-2">
                    {attachments.map(att => (
                      <div 
                        key={att.id} 
                        className="flex items-center gap-2 p-3 bg-background rounded-lg"
                      >
                        <Download className="w-4 h-4 text-gold" />
                        <span className="text-sm">{att.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice section simulation */}
              {hasHomework && (
                <div className="mb-8 p-6 border border-gold/30 rounded-xl bg-gold/5">
                  <h3 className="font-display text-lg text-foreground mb-2">
                    {homeworkTitle}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Здесь студент увидит описание задания
                  </p>

                  {/* Submission simulation */}
                  <div className="space-y-3">
                    <Textarea 
                      placeholder="Напишите ваш ответ..."
                      rows={4}
                      disabled
                      className="bg-background"
                    />
                    <Button 
                      disabled
                      className="bg-gold hover:bg-gold-dark text-primary-foreground gap-2 opacity-50"
                    >
                      <Send className="w-4 h-4" /> Отправить
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation simulation */}
            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2 flex-1 justify-center border-gold/30 text-gold hover:bg-gold/10" disabled>
                <ArrowLeft className="w-4 h-4" /> Назад
              </Button>
              <Button className="gap-2 flex-1 justify-center bg-gold hover:bg-gold-dark text-primary-foreground" disabled>
                Дальше <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
