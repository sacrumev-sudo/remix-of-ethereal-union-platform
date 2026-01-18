import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Link as LinkIcon, Upload, X, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LessonMaterial {
  id: string;
  type: 'link' | 'file';
  title: string;
  url: string;
}

interface LessonMaterialsSectionProps {
  materials: LessonMaterial[];
  onChange: (materials: LessonMaterial[]) => void;
}

export default function LessonMaterialsSection({ materials, onChange }: LessonMaterialsSectionProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleAddLink = useCallback(() => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    
    const newMaterial: LessonMaterial = {
      id: `material-${Date.now()}`,
      type: 'link',
      title: linkTitle.trim(),
      url: linkUrl.trim(),
    };
    
    onChange([...materials, newMaterial]);
    setLinkDialogOpen(false);
    setLinkTitle('');
    setLinkUrl('');
  }, [linkTitle, linkUrl, materials, onChange]);

  const handleRemoveMaterial = useCallback((id: string) => {
    onChange(materials.filter(m => m.id !== id));
  }, [materials, onChange]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    // In a real app, you would upload these files to storage
    // For now, we'll create mock file entries
    const newMaterials: LessonMaterial[] = files.map(file => ({
      id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'file' as const,
      title: file.name,
      url: URL.createObjectURL(file), // Mock URL
    }));
    
    onChange([...materials, ...newMaterials]);
  }, [materials, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newMaterials: LessonMaterial[] = Array.from(files).map(file => ({
      id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'file' as const,
      title: file.name,
      url: URL.createObjectURL(file),
    }));
    
    onChange([...materials, ...newMaterials]);
    e.target.value = ''; // Reset input
  }, [materials, onChange]);

  return (
    <div className="premium-card">
      <h3 className="font-medium text-lg mb-4">Материалы модуля</h3>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setLinkDialogOpen(true)}
        >
          <LinkIcon className="w-4 h-4" />
          Добавить ссылку
        </Button>
        
        <label>
          <Button
            asChild
            className="gap-2 bg-gold hover:bg-gold-dark text-primary-foreground cursor-pointer"
          >
            <span>
              <Upload className="w-4 h-4" />
              Загрузить файлы
            </span>
          </Button>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      </div>

      {/* Materials list */}
      {materials.length > 0 && (
        <div className="space-y-2 mb-4">
          {materials.map(material => (
            <div
              key={material.id}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group"
            >
              {material.type === 'link' ? (
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{material.title}</p>
                <p className="text-xs text-muted-foreground truncate">{material.url}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveMaterial(material.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragging 
            ? "border-gold bg-gold/5" 
            : "border-border/50 hover:border-border"
        )}
      >
        <Upload className={cn(
          "w-8 h-8 mx-auto mb-2 transition-colors",
          isDragging ? "text-gold" : "text-muted-foreground"
        )} />
        <p className="text-sm text-muted-foreground">
          Перетащите файлы сюда
        </p>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить ссылку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Название ссылки"
                className="mt-1"
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleAddLink} 
              className="bg-gold hover:bg-gold-dark"
              disabled={!linkTitle.trim() || !linkUrl.trim()}
            >
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
