import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, GripVertical, Trash2, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface LessonTask {
  id: string;
  title: string;
  order: number;
}

interface LessonTasksEditorProps {
  tasks: LessonTask[];
  onChange: (tasks: LessonTask[]) => void;
  className?: string;
}

interface SortableTaskItemProps {
  task: LessonTask;
  onUpdate: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function SortableTaskItem({ task, onUpdate, onDelete }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-background border border-border rounded-lg group transition-colors",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <Checkbox disabled className="pointer-events-none" />
      
      <Input
        value={task.title}
        onChange={(e) => onUpdate(task.id, e.target.value)}
        placeholder="Название задачи..."
        className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function LessonTasksEditor({
  tasks,
  onChange,
  className,
}: LessonTasksEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex).map((t, i) => ({
        ...t,
        order: i + 1,
      }));
      
      onChange(newTasks);
    }
  };

  const handleAddTask = () => {
    const newTask: LessonTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      order: tasks.length + 1,
    };
    onChange([...tasks, newTask]);
  };

  const handleUpdateTask = (id: string, title: string) => {
    onChange(tasks.map((t) => (t.id === id ? { ...t, title } : t)));
  };

  const handleDeleteTask = (id: string) => {
    onChange(
      tasks
        .filter((t) => t.id !== id)
        .map((t, i) => ({ ...t, order: i + 1 }))
    );
  };

  return (
    <div className={cn("premium-card", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-gold" />
          <h3 className="font-medium">Задачи для выполнения</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTask}
          className="gap-1"
        >
          <Plus className="w-4 h-4" /> Добавить задачу
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground mb-3">
            Добавьте задачи, которые должен выполнить ученик
          </p>
          <Button variant="outline" onClick={handleAddTask} className="gap-1">
            <Plus className="w-4 h-4" /> Добавить первую задачу
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasks
                .sort((a, b) => a.order - b.order)
                .map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleUpdateTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Эти задачи будут отображаться на дашборде ученика как чек-лист для выполнения.
      </p>
    </div>
  );
}
