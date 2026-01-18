import { useAuth } from '@/contexts/AuthContext';
import { getLibrary, getUserAccess } from '@/lib/storage';
import { LibraryItem } from '@/data/mockData';
import { FileText, Video, Headphones, FileType, Lock, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function StudentLibrary() {
  const { effectiveUser } = useAuth();
  const library = getLibrary();
  const userAccess = effectiveUser ? getUserAccess(effectiveUser.id) : [];
  
  const hasPaidAccess = userAccess.length > 0;
  const userProgramIds = userAccess.map(a => a.programId);

  const checkAccess = (item: LibraryItem): boolean => {
    if (item.accessRule === 'freeForAll') return true;
    if (item.accessRule === 'paidOnly') return hasPaidAccess;
    if (item.accessRule === 'programOnly') {
      return item.programIds?.some(pid => userProgramIds.includes(pid)) || false;
    }
    return false;
  };

  const getIcon = (type: LibraryItem['type']) => {
    switch (type) {
      case 'article': return FileText;
      case 'pdf': return FileType;
      case 'video': return Video;
      case 'audio': return Headphones;
      default: return FileText;
    }
  };

  const freeItems = library.filter(item => item.category === 'free');
  const studentItems = library.filter(item => item.category === 'students');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="font-display text-3xl text-foreground mb-8">Библиотека</h1>

      {/* Free Section */}
      <section className="mb-12">
        <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
          <span>Бесплатно</span>
          <Badge variant="secondary" className="text-xs">Открыто для всех</Badge>
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {freeItems.map((item) => {
            const Icon = getIcon(item.type);
            const hasAccess = checkAccess(item);

            return (
              <div key={item.id} className="premium-card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-3 text-gold hover:text-gold-light p-0 h-auto"
                    >
                      Открыть →
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Students Section */}
      <section>
        <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
          <span>Для учениц</span>
          <Badge variant="outline" className="text-xs border-gold text-gold">
            Доступно участницам
          </Badge>
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {studentItems.map((item) => {
            const Icon = getIcon(item.type);
            const hasAccess = checkAccess(item);

            return (
              <div 
                key={item.id} 
                className={`premium-card ${!hasAccess ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    hasAccess ? 'bg-gold/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${hasAccess ? 'text-gold' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{item.title}</h3>
                      {hasAccess ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    
                    {hasAccess ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-3 text-gold hover:text-gold-light p-0 h-auto"
                      >
                        Открыть →
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-3">
                        {item.accessRule === 'paidOnly' 
                          ? 'Доступно участницам любой программы'
                          : 'Доступно участницам определённых программ'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
