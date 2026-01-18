import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminSalesPages() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Продажные лендинги</h1>
        <Button className="gap-2 bg-gold hover:bg-gold-dark text-primary-foreground">
          <Plus className="w-4 h-4" /> Создать
        </Button>
      </div>
      <div className="premium-card text-center py-12">
        <p className="text-muted-foreground">Лендинги появятся здесь</p>
        <p className="text-sm text-muted-foreground mt-2">Раздел в разработке</p>
      </div>
    </div>
  );
}
