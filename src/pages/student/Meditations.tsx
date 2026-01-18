import { getMeditations } from '@/lib/storage';
import { Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentMeditations() {
  const meditations = getMeditations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-foreground mb-2">Медитации</h1>
        <p className="text-muted-foreground">
          Практики для развития осознанности и связи с собой
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {meditations.map((meditation) => (
          <div key={meditation.id} className="premium-card">
            <div className="flex items-center gap-2 text-sm text-gold mb-3">
              <Clock className="w-4 h-4" />
              <span>{meditation.duration}</span>
            </div>
            
            <h3 className="font-display text-xl text-foreground mb-2">
              {meditation.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {meditation.description}
            </p>

            <div className="flex items-center gap-3">
              <Button className="bg-gold hover:bg-gold-dark text-primary-foreground gap-2">
                <Play className="w-4 h-4" />
                Начать
              </Button>
              {meditation.type === 'audio' && (
                <span className="text-xs text-muted-foreground">Аудио-практика</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
