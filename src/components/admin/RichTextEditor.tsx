import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Blockquote from '@tiptap/extension-blockquote';
import ImageResize from 'tiptap-extension-resize-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
  Highlighter,
  Palette,
  AlertTriangle,
  ChevronDown,
  Plus,
  Trash2,
  RowsIcon,
  Columns,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import KinescopeVideo from './extensions/KinescopeVideo';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  large?: boolean;
}

const ToolbarButton = ({ onClick, isActive, disabled, children, title, large }: ToolbarButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-0 hover:bg-muted/50 transition-colors",
      large ? "h-10 w-10 rounded-xl" : "h-8 w-8 rounded-lg",
      isActive && "bg-gold/20 text-gold hover:bg-gold/30"
    )}
  >
    {children}
  </Button>
);

const ToolbarDivider = () => (
  <div className="w-px h-5 bg-border/50 mx-1" />
);

// Color options for text and highlight
const TEXT_COLORS = [
  { name: 'Чёрный', value: '#1a1a1a' },
  { name: 'Красный', value: '#dc2626' },
  { name: 'Оранжевый', value: '#ea580c' },
  { name: 'Зелёный', value: '#16a34a' },
  { name: 'Синий', value: '#2563eb' },
  { name: 'Фиолетовый', value: '#9333ea' },
  { name: 'Розовый', value: '#db2777' },
  { name: 'Золотой', value: '#b8860b' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Жёлтый', value: '#fef08a' },
  { name: 'Розовый', value: '#fbcfe8' },
  { name: 'Зелёный', value: '#bbf7d0' },
  { name: 'Голубой', value: '#bae6fd' },
  { name: 'Фиолетовый', value: '#ddd6fe' },
  { name: 'Оранжевый', value: '#fed7aa' },
];

// Quote color variants - matching the platform branding

type QuoteVariant = 'gold' | 'chocolate' | 'pink' | 'blue' | 'green' | 'purple';

const QUOTE_COLORS: { name: string; variant: QuoteVariant; borderColor: string; bgColor: string }[] = [
  { name: 'Золотой', variant: 'gold', borderColor: '#b8860b', bgColor: 'rgba(184, 134, 11, 0.2)' },
  { name: 'Шоколадный', variant: 'chocolate', borderColor: '#5D4037', bgColor: 'rgba(93, 64, 55, 0.15)' },
  { name: 'Розовый', variant: 'pink', borderColor: '#e879a9', bgColor: 'rgba(236, 182, 206, 0.35)' },
  { name: 'Синий', variant: 'blue', borderColor: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  { name: 'Зелёный', variant: 'green', borderColor: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.15)' },
  { name: 'Фиолетовый', variant: 'purple', borderColor: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.15)' },
];

const CustomBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      variant: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-variant'),
        renderHTML: (attributes) => (attributes.variant ? { 'data-variant': attributes.variant } : {}),
      },
    };
  },
});

// Callout types (Important, Tip, Info)
const CALLOUT_TYPES = [
  { 
    name: 'Важно', 
    type: 'warning',
    icon: '⚠️',
    borderColor: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.15)',
    textColor: '#92400e'
  },
  { 
    name: 'Совет', 
    type: 'tip',
    icon: '💡',
    borderColor: '#22c55e', 
    bgColor: 'rgba(34, 197, 94, 0.15)',
    textColor: '#166534'
  },
  { 
    name: 'Информация', 
    type: 'info',
    icon: 'ℹ️',
    borderColor: '#3b82f6', 
    bgColor: 'rgba(59, 130, 246, 0.15)',
    textColor: '#1e40af'
  },
];

interface EditorToolbarProps {
  editor: Editor;
  onInsertVideo: () => void;
  onInsertImage: () => void;
  onInsertLink: () => void;
  onInsertTable: () => void;
}

const EditorToolbar = ({ editor, onInsertVideo, onInsertImage, onInsertLink, onInsertTable }: EditorToolbarProps) => {
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [quoteColorOpen, setQuoteColorOpen] = useState(false);
  const [calloutOpen, setCalloutOpen] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);

  const isInTable = editor.isActive('table');

  if (!editor) return null;

  const applyQuoteVariant = (variant: QuoteVariant | null) => {
    // If cursor is inside an existing quote — recolor it
    if (editor.isActive('blockquote')) {
      editor.chain().focus().updateAttributes('blockquote', { variant }).run();
      setQuoteColorOpen(false);
      return;
    }

    // Insert empty quote block with placeholder - user will see the placeholder from Tiptap
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'blockquote',
        attrs: { variant },
        content: [
          {
            type: 'paragraph',
          },
        ],
      })
      .run();

    setQuoteColorOpen(false);
  };

  const insertCallout = (callout: typeof CALLOUT_TYPES[0]) => {
    const calloutHtml = `<div class="callout callout-${callout.type}" style="border-left: 4px solid ${callout.borderColor}; background: ${callout.bgColor}; padding: 1em 1.25em; margin: 1.25em 0; border-radius: 0 0.75em 0.75em 0;"><p><strong>${callout.icon} ${callout.name}:</strong> Введите текст...</p></div>`;
    editor.chain().focus().insertContent(calloutHtml).run();
    setCalloutOpen(false);
  };

  return (
    <div className="editor-toolbar border-t border-border/30 p-3 bg-card/95 backdrop-blur-sm rounded-b-xl">
      {/* Row 1: Headers, formatting, alignment, lists */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {/* Headers */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Заголовок 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Заголовок 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Заголовок 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Basic formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Жирный"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Курсив"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        {/* Text Color */}
        <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Цвет текста"
              className="h-8 w-8 p-0 rounded-lg hover:bg-muted/50"
            >
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    editor.chain().focus().setColor(color.value).run();
                    setTextColorOpen(false);
                  }}
                  className="w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <button
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setTextColorOpen(false);
              }}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Сбросить цвет
            </button>
          </PopoverContent>
        </Popover>

        {/* Highlight */}
        <Popover open={highlightOpen} onOpenChange={setHighlightOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Выделение фоном"
              className={cn(
                "h-8 w-8 p-0 rounded-lg hover:bg-muted/50",
                editor.isActive('highlight') && "bg-gold/20 text-gold"
              )}
            >
              <Highlighter className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="grid grid-cols-3 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color: color.value }).run();
                    setHighlightOpen(false);
                  }}
                  className="w-8 h-8 rounded-md border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <button
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setHighlightOpen(false);
              }}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Убрать выделение
            </button>
          </PopoverContent>
        </Popover>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="По левому краю"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="По центру"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="По правому краю"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Маркированный список"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Нумерованный список"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Чек-лист"
        >
          <CheckSquare className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Row 2: Quote variants, Callouts, Code, Media, Link, Table */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Quote with color picker */}
        <Popover open={quoteColorOpen} onOpenChange={setQuoteColorOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Цитата (выбрать цвет)"
              className={cn(
                "h-8 px-2 rounded-lg hover:bg-muted/50 gap-1",
                editor.isActive('blockquote') && "bg-gold/20 text-gold"
              )}
            >
              <Quote className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <p className="text-xs text-muted-foreground mb-2">Выберите цвет цитаты:</p>
            <div className="space-y-1">
              {QUOTE_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => applyQuoteVariant(color.variant)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm"
                >
                  <div
                    className="w-4 h-4 rounded border"
                    style={{
                      borderLeft: `3px solid ${color.borderColor}`,
                      backgroundColor: color.bgColor,
                    }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => {
                  if (editor.isActive('blockquote')) {
                    editor.chain().focus().updateAttributes('blockquote', { variant: null }).run();
                  } else {
                    editor.chain().focus().toggleBlockquote().run();
                  }
                  setQuoteColorOpen(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Простая цитата (по умолчанию)
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Callout blocks (Important, Tip, Info) */}
        <Popover open={calloutOpen} onOpenChange={setCalloutOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Блоки (Важно, Совет, Инфо)"
              className="h-8 px-2 rounded-lg hover:bg-muted/50 gap-1"
            >
              <AlertTriangle className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <p className="text-xs text-muted-foreground mb-2">Вставить блок:</p>
            <div className="space-y-1">
              {CALLOUT_TYPES.map((callout) => (
                <button
                  key={callout.type}
                  onClick={() => insertCallout(callout)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm"
                >
                  <div 
                    className="w-5 h-5 rounded flex items-center justify-center text-xs"
                    style={{ 
                      backgroundColor: callout.bgColor,
                      borderLeft: `3px solid ${callout.borderColor}`
                    }}
                  >
                    {callout.icon}
                  </div>
                  {callout.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Код"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Разделитель"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Media */}
        <ToolbarButton onClick={onInsertImage} title="Вставить изображение">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onInsertVideo} title="Вставить видео Kinescope">
          <Video className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <ToolbarButton
          onClick={onInsertLink}
          isActive={editor.isActive('link')}
          title="Добавить ссылку"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Table - with menu when inside table */}
        {isInTable ? (
          <Popover open={tableMenuOpen} onOpenChange={setTableMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Управление таблицей"
                className="h-8 px-2 rounded-lg hover:bg-muted/50 gap-1 bg-gold/20 text-gold"
              >
                <TableIcon className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                <button
                  onClick={() => { editor.chain().focus().addRowBefore().run(); setTableMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm"
                >
                  <Plus className="w-4 h-4" /> Добавить строку сверху
                </button>
                <button
                  onClick={() => { editor.chain().focus().addRowAfter().run(); setTableMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm"
                >
                  <Plus className="w-4 h-4" /> Добавить строку снизу
                </button>
                <button
                  onClick={() => { editor.chain().focus().addColumnBefore().run(); setTableMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm"
                >
                  <Columns className="w-4 h-4" /> Добавить колонку слева
                </button>
                <button
                  onClick={() => { editor.chain().focus().addColumnAfter().run(); setTableMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm"
                >
                  <Columns className="w-4 h-4" /> Добавить колонку справа
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => { editor.chain().focus().deleteRow().run(); setTableMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm text-destructive"
                >
                  <Trash2 className="w-4 h-4" /> Удалить строку
                </button>
                <button
                  onClick={() => { editor.chain().focus().deleteColumn().run(); setTableMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm text-destructive"
                >
                  <Trash2 className="w-4 h-4" /> Удалить колонку
                </button>
                <button
                  onClick={() => { editor.chain().focus().deleteTable().run(); setTableMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-muted text-sm text-destructive"
                >
                  <Trash2 className="w-4 h-4" /> Удалить таблицу
                </button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <ToolbarButton
            onClick={onInsertTable}
            title="Вставить таблицу"
          >
            <TableIcon className="w-4 h-4" />
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* Clear formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Очистить форматирование"
        >
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </div>
  );
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Начните писать...",
  className,
  minHeight = "400px",
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: false,
      }),
      CustomBlockquote,
      KinescopeVideo,
      ImageResize.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full h-auto my-4 shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-gold underline hover:text-gold-light cursor-pointer',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted/50 px-3 py-2 text-left font-medium',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border px-3 py-2',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none pl-0 space-y-2',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        includeChildren: true,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'max-w-none focus:outline-none px-6 py-6',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, '');
    
    setLinkUrl(previousUrl || '');
    setLinkText(selectedText || '');
    setLinkDialogOpen(true);
  }, [editor]);

  const confirmLink = useCallback(() => {
    if (!editor) return;

    if (!linkUrl || linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    }
    
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
  }, [editor, linkUrl]);

  const handleInsertImage = useCallback(() => {
    setImageUrl('');
    setImageDialogOpen(true);
  }, []);

  const confirmImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageDialogOpen(false);
    setImageUrl('');
  }, [editor, imageUrl]);

  const handleInsertVideo = useCallback(() => {
    setVideoUrl('');
    setVideoDialogOpen(true);
  }, []);

  const parseKinescopeUrl = (url: string): string | null => {
    // Support various Kinescope URL formats:
    // - https://kinescope.io/embed/xxxxx
    // - https://kinescope.io/xxxxx
    // - https://kinescope.io/video/detail/xxxxx
    // - iframe with src="https://kinescope.io/embed/xxxxx"
    
    // Match direct URLs with optional paths like /video/detail/ or /embed/
    const directMatch = url.match(/kinescope\.io\/(?:video\/detail\/|embed\/)?([a-zA-Z0-9-]+)/);
    if (directMatch) return directMatch[1];
    
    // Match iframe src attribute
    const iframeMatch = url.match(/src=["'].*?kinescope\.io\/(?:embed\/)?([a-zA-Z0-9-]+)/);
    if (iframeMatch) return iframeMatch[1];
    
    return null;
  };

  const confirmVideo = useCallback(() => {
    if (!editor || !videoUrl) return;
    
    const videoId = parseKinescopeUrl(videoUrl);
    if (videoId) {
      // Use the custom KinescopeVideo extension command
      editor.chain().focus().setKinescopeVideo({
        src: `https://kinescope.io/embed/${videoId}`,
        videoId,
      }).run();
    } else {
      // Fallback for non-Kinescope URLs - just insert as text
      editor.chain().focus().insertContent(`<p>${videoUrl}</p>`).run();
    }
    
    setVideoDialogOpen(false);
    setVideoUrl('');
  }, [editor, videoUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(f => f.type.startsWith('image/'));
    
    if (imageFile && editor) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(imageFile);
    }
  }, [editor]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  if (!editor) return null;

  return (
    <div className={cn("border border-border/50 rounded-xl overflow-hidden bg-ivory shadow-sm", className)}>
      <div 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative transition-all duration-200",
          isDragging && "ring-2 ring-gold ring-inset"
        )}
      >
        <EditorContent editor={editor} className="editor-content" />
        
        {isDragging && (
          <div className="absolute inset-0 bg-gold/10 flex items-center justify-center pointer-events-none">
            <div className="bg-card/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-gold/30">
              <ImageIcon className="w-8 h-8 text-gold mx-auto mb-2" />
              <p className="text-sm font-medium text-center">Отпустите для вставки изображения</p>
            </div>
          </div>
        )}
      </div>
      
      <EditorToolbar
        editor={editor}
        onInsertVideo={handleInsertVideo}
        onInsertImage={handleInsertImage}
        onInsertLink={handleInsertLink}
        onInsertTable={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      />

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить ссылку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL ссылки</Label>
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
            <Button onClick={confirmLink} className="bg-gold hover:bg-gold-dark">
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вставить изображение</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL изображения</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Или перетащите изображение прямо в редактор
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmImage} className="bg-gold hover:bg-gold-dark">
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вставить видео Kinescope</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ссылка на видео</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://kinescope.io/xxx или код iframe"
                className="mt-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Вставьте ссылку на видео Kinescope или код встраивания (iframe)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmVideo} className="bg-gold hover:bg-gold-dark">
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}