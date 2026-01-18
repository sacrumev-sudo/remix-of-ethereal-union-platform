import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  order: number;
}

interface QuizEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

export default function QuizEditor({ questions, onChange }: QuizEditorProps) {
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: '',
      options: [
        { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
        { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
      ],
      order: questions.length + 1,
    };
    onChange([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, questionText: string) => {
    onChange(questions.map(q => q.id === id ? { ...q, question: questionText } : q));
  };

  const addOption = (questionId: string) => {
    onChange(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...q.options, { id: `opt-${Date.now()}`, text: '', isCorrect: false }],
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    onChange(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => o.id === optionId ? { ...o, text } : o),
        };
      }
      return q;
    }));
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    onChange(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => ({ ...o, isCorrect: o.id === optionId })),
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionId: string) => {
    onChange(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = q.options.filter(o => o.id !== optionId);
        // Ensure at least one is correct
        if (newOptions.length > 0 && !newOptions.some(o => o.isCorrect)) {
          newOptions[0].isCorrect = true;
        }
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-4">
      {questions.map((q, index) => (
        <div key={q.id} className="p-4 border border-border rounded-lg bg-muted/30">
          <div className="flex items-start gap-2 mb-3">
            <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Вопрос {index + 1}</Label>
              <Input
                value={q.question}
                onChange={(e) => updateQuestion(q.id, e.target.value)}
                placeholder="Введите вопрос..."
                className="mt-1"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive h-8 w-8"
              onClick={() => removeQuestion(q.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 ml-6">
            {q.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2">
                <Checkbox
                  checked={opt.isCorrect}
                  onCheckedChange={() => setCorrectOption(q.id, opt.id)}
                  id={opt.id}
                />
                <Input
                  value={opt.text}
                  onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                  placeholder="Вариант ответа..."
                  className="flex-1 h-8 text-sm"
                />
                {q.options.length > 2 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeOption(q.id, opt.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7"
              onClick={() => addOption(q.id)}
            >
              <Plus className="w-3 h-3 mr-1" /> Добавить вариант
            </Button>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addQuestion}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" /> Добавить вопрос
      </Button>
    </div>
  );
}
