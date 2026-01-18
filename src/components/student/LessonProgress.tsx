import { Progress } from '@/components/ui/progress';
import { Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonProgressProps {
  percent: number;
  showStars?: boolean;
  className?: string;
}

export default function LessonProgress({ percent, showStars = true, className }: LessonProgressProps) {
  const isComplete = percent === 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Прогресс урока</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{percent}%</span>
          {isComplete && showStars && (
            <div className="flex items-center gap-0.5 animate-pulse">
              <Sparkles className="w-4 h-4 text-gold" />
              <Star className="w-4 h-4 text-gold fill-gold" />
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
          )}
        </div>
      </div>
      
      <Progress 
        value={percent} 
        className={cn(
          "h-2 transition-all",
          isComplete && "bg-gold/20"
        )}
      />

      {/* Progress steps - hidden from student view, shown only for admins */}

      {isComplete && showStars && (
        <div className="mt-4 p-4 bg-gold/10 rounded-xl border border-gold/30 text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3].map((i) => (
              <Star key={i} className="w-6 h-6 text-gold fill-gold animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p className="text-sm font-medium text-foreground">
            Отлично! Вы завершили этот урок! ⭐
          </p>
        </div>
      )}
    </div>
  );
}
