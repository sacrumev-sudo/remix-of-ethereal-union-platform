import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPrograms, cloneProgram, updateProgram, addProgram } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { Program } from '@/data/mockData';

export default function AdminPrograms() {
  const navigate = useNavigate();
  const [programs, setLocalPrograms] = useState<Program[]>(() => getPrograms());

  const reloadPrograms = () => {
    setLocalPrograms(getPrograms());
  };

  const handleClone = (id: string) => {
    cloneProgram(id);
    toast.success('Программа скопирована');
    reloadPrograms();
  };

  const handleToggleStatus = (id: string, current: 'published' | 'hidden') => {
    updateProgram(id, { status: current === 'published' ? 'hidden' : 'published' });
    toast.success('Статус обновлён');
    reloadPrograms();
  };

  // A) Создание программы — сразу переход на единый экран ProgramEdit (без модалки)
  const handleCreateProgram = () => {
    const newProgram: Program = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `program-${Date.now()}`,
      title: 'Новая программа',
      description: '',
      status: 'hidden',
      outline: [],
      createdAt: new Date().toISOString(),
    };

    addProgram(newProgram);
    toast.success('Программа создана');
    navigate(`/admin/programs/${newProgram.id}/edit`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Программы</h1>
        <Button 
          onClick={handleCreateProgram}
          className="gap-2 bg-gold hover:bg-gold-dark text-primary-foreground"
        >
          <Plus className="w-4 h-4" /> Создать
        </Button>
      </div>

      <div className="space-y-4">
        {programs.map(program => (
          <div key={program.id} className="premium-card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg text-foreground">{program.title}</h3>
                <Badge variant={program.status === 'published' ? 'default' : 'secondary'}>
                  {program.status === 'published' ? 'Опубликовано' : 'Скрыто'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(program.id, program.status)}>
                {program.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleClone(program.id)}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Link to={`/admin/programs/${program.id}/edit`}><Edit className="w-4 h-4" /></Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
