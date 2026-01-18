import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  text: string;
  order: number;
}

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export default function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const addItem = () => {
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      text: '',
      order: items.length + 1,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, text: string) => {
    onChange(items.map(item => item.id === id ? { ...item, text } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          <div className="w-5 h-5 border-2 border-border rounded flex-shrink-0" />
          <Input
            value={item.text}
            onChange={(e) => updateItem(item.id, e.target.value)}
            placeholder={`Пункт ${index + 1}...`}
            className="flex-1 h-8 text-sm"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" /> Добавить пункт
      </Button>
    </div>
  );
}
