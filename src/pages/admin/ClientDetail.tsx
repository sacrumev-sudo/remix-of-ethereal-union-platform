import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById, getUserAccess, getUserPayments, getUserNotes, getPrograms, getAccessGrants, grantAccess, revokeAccess, addAdminNote, updateUser } from '@/lib/storage';
import { formatDateRu } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Eye, ExternalLink, Plus, Trash2, Search, Lock, Unlock } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

// Questionnaire field translations
const questionnaireLabels: Record<string, string> = {
  goals: 'Цели',
  experience: 'Опыт',
  expectations: 'Ожидания',
  age: 'Возраст',
  occupation: 'Занятость',
  relationship: 'Отношения',
  motivation: 'Мотивация',
  challenges: 'Сложности',
  source: 'Источник',
  comments: 'Комментарии',
};

export default function AdminClientDetail() {
  const { userId } = useParams();
  const { user: adminUser, startImpersonation } = useAuth();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'public' | 'private'>('private'); // Default to private
  const [selectedProgram, setSelectedProgram] = useState('');
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [questionnaireNote, setQuestionnaireNote] = useState('');
  const [showPublicConfirm, setShowPublicConfirm] = useState(false);

  const client = userId ? getUserById(userId) : null;
  const isAdmin = adminUser?.role === 'admin';
  
  const access = client ? getUserAccess(client.id) : [];
  const accessGrants = client ? getAccessGrants().filter(g => g.userId === client.id) : [];
  const payments = client ? getUserPayments(client.id) : [];
  // Sort notes: newest first
  const notes = client ? getUserNotes(client.id, isAdmin).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) : [];
  const programs = getPrograms();
  const accessibleProgramIds = access.map(a => a.programId);

  // Build unified payments table data
  const paymentsTableData = useMemo(() => {
    return payments.map(p => {
      const program = programs.find(pr => pr.id === p.programId);
      const grant = accessGrants.find(g => g.programId === p.programId);
      return {
        id: p.id,
        programName: program?.title || 'Неизвестная программа',
        paymentDate: p.date,
        accessStart: grant?.startDate || grant?.createdAt || '-',
        accessEnd: grant?.endDate || '-',
        amount: p.amount,
        isInstallment: p.status === 'installment',
        installmentRemaining: p.installmentRemaining || 0,
        installmentDate: p.status === 'installment' ? p.date : '-',
      };
    });
  }, [payments, programs, accessGrants]);

  // Filter payments table
  const filteredPayments = useMemo(() => {
    if (!paymentsSearch) return paymentsTableData;
    const searchLower = paymentsSearch.toLowerCase();
    return paymentsTableData.filter(p => 
      p.programName.toLowerCase().includes(searchLower) ||
      p.paymentDate.includes(searchLower) ||
      p.amount.toString().includes(searchLower)
    );
  }, [paymentsTableData, paymentsSearch]);
  
  if (!client) {
    return <div className="text-center py-12 text-foreground">Клиент не найден</div>;
  }

  const handleImpersonate = () => {
    startImpersonation(client);
    navigate('/app');
  };

  const handleGrantAccess = () => {
    if (!selectedProgram || !adminUser) return;
    grantAccess({ userId: client.id, programId: selectedProgram, reason: 'Ручная выдача', grantedBy: adminUser.id });
    toast.success('Доступ выдан');
    setSelectedProgram('');
    window.location.reload();
  };

  const handleRevokeAccess = (programId: string) => {
    revokeAccess(client.id, programId);
    toast.success('Доступ отозван');
    window.location.reload();
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !adminUser) return;
    
    // If trying to add public note, show confirmation
    if (noteType === 'public') {
      setShowPublicConfirm(true);
      return;
    }
    
    addNote();
  };

  const addNote = () => {
    if (!newNote.trim() || !adminUser) return;
    addAdminNote({ userId: client.id, type: noteType, content: newNote.trim(), createdBy: adminUser.id });
    toast.success('Заметка добавлена');
    setNewNote('');
    setNoteType('private');
    setShowPublicConfirm(false);
    // Don't reload page to prevent glitch
    window.location.reload();
  };

  const handleSaveQuestionnaireNote = () => {
    if (!questionnaireNote.trim()) return;
    
    const existingQuestionnaire = client.questionnaire || {};
    const existingNotes = existingQuestionnaire._adminNotes || '';
    const newNotes = existingNotes 
      ? `${existingNotes}\n\n[${formatDateRu(new Date().toISOString().split('T')[0])}]\n${questionnaireNote.trim()}`
      : `[${formatDateRu(new Date().toISOString().split('T')[0])}]\n${questionnaireNote.trim()}`;
    
    updateUser(client.id, {
      questionnaire: {
        ...existingQuestionnaire,
        _adminNotes: newNotes,
      }
    });
    
    toast.success('Заметка к анкете сохранена');
    setQuestionnaireNote('');
    window.location.reload();
  };

  const getQuestionnaireLabel = (key: string): string => {
    if (key.startsWith('_')) return ''; // Skip internal fields
    return questionnaireLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div>
      <Link to="/admin/clients" className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Клиентки
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          {/* Client name with golden shimmer */}
          <h1 className="font-display text-2xl text-name-shimmer">
            {client.name || 'Без имени'}
          </h1>
          <p className="text-foreground/80">{client.email}</p>
          {client.telegramUsername && (
            <a href={`https://t.me/${client.telegramUsername}`} target="_blank" className="text-primary text-sm flex items-center gap-1 mt-1">
              @{client.telegramUsername} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <Button onClick={handleImpersonate} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Eye className="w-4 h-4" /> Глазами ученицы
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Access */}
        <div className="premium-card">
          <h3 className="font-display text-lg text-foreground mb-4">Доступы</h3>
          {access.length > 0 ? (
            <div className="space-y-2 mb-4">
              {access.map(a => {
                const prog = programs.find(p => p.id === a.programId);
                return (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-foreground">{prog?.title}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRevokeAccess(a.programId)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-foreground/60 text-sm mb-4">Нет доступов</p>}
          
          <div className="flex gap-2">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="flex-1 text-foreground"><SelectValue placeholder="Выберите программу" /></SelectTrigger>
              <SelectContent>
                {programs.filter(p => !accessibleProgramIds.includes(p.id)).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGrantAccess} disabled={!selectedProgram}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Unified Payments Table */}
        <div className="premium-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-foreground">Оплаты и доступы</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={paymentsSearch}
                onChange={(e) => setPaymentsSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>
          
          {filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground/70">Программа</TableHead>
                    <TableHead className="text-foreground/70">Дата оплаты</TableHead>
                    <TableHead className="text-foreground/70">Начало доступа</TableHead>
                    <TableHead className="text-foreground/70">Окончание доступа</TableHead>
                    <TableHead className="text-foreground/70">Сумма</TableHead>
                    <TableHead className="text-foreground/70">Рассрочка</TableHead>
                    <TableHead className="text-foreground/70">Дата рассрочки</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="text-foreground font-medium">{p.programName}</TableCell>
                      <TableCell className="text-foreground/80">{formatDateRu(p.paymentDate)}</TableCell>
                      <TableCell className="text-foreground/80">{p.accessStart !== '-' ? formatDateRu(p.accessStart) : '-'}</TableCell>
                      <TableCell className="text-foreground/80">{p.accessEnd !== '-' ? formatDateRu(p.accessEnd) : '-'}</TableCell>
                      <TableCell className="text-primary font-medium">{p.amount.toLocaleString()} ₽</TableCell>
                      <TableCell className="text-foreground/80">
                        {p.isInstallment ? (
                          <span className="text-amber-600">Остаток: {p.installmentRemaining.toLocaleString()} ₽</span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {p.isInstallment ? formatDateRu(p.installmentDate) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : <p className="text-foreground/60 text-sm">Нет оплат</p>}
        </div>

        {/* Notes - sorted newest first, default private */}
        <div className="premium-card lg:col-span-2">
          <h3 className="font-display text-lg text-foreground mb-4">Заметки</h3>
          <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
            {notes.length > 0 ? notes.map(n => (
              <div key={n.id} className={`p-3 rounded-lg ${n.type === 'private' ? 'bg-amber-50 border border-amber-200' : 'bg-muted'}`}>
                <p className="text-sm text-foreground">{n.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-foreground/60">{formatDateRu(n.createdAt)}</p>
                  {n.type === 'private' && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      <Lock className="w-3 h-3" /> приватная
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-foreground/60 text-sm">Нет заметок</p>
            )}
          </div>
          <div className="flex gap-2">
            <Textarea 
              value={newNote} 
              onChange={(e) => setNewNote(e.target.value)} 
              placeholder="Новая заметка..." 
              className="flex-1" 
              rows={2} 
            />
            <div className="flex flex-col gap-2">
              {isAdmin && (
                <Select value={noteType} onValueChange={(v) => setNoteType(v as 'public' | 'private')}>
                  <SelectTrigger className="w-32 text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Приватная</SelectItem>
                    <SelectItem value="public">Общая</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleAddNote} className="bg-primary hover:bg-primary/90">Добавить</Button>
            </div>
          </div>
        </div>

        {/* Questionnaire with Russian labels and admin notes */}
        {isAdmin && client.questionnaire && (
          <div className="premium-card lg:col-span-2">
            <h3 className="font-display text-lg text-foreground mb-4">Анкета</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {Object.entries(client.questionnaire)
                .filter(([key]) => !key.startsWith('_'))
                .map(([key, value]) => (
                <div key={key} className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-foreground/60 mb-1">{getQuestionnaireLabel(key)}</p>
                  <p className="text-foreground">{value}</p>
                </div>
              ))}
            </div>
            
            {/* Admin notes for questionnaire */}
            {client.questionnaire._adminNotes && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Мои пометки:</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{client.questionnaire._adminNotes}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Textarea
                value={questionnaireNote}
                onChange={(e) => setQuestionnaireNote(e.target.value)}
                placeholder="Добавить пометку к анкете..."
                className="flex-1"
                rows={2}
              />
              <Button onClick={handleSaveQuestionnaireNote} disabled={!questionnaireNote.trim()}>
                Сохранить
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation dialog for public notes */}
      <AlertDialog open={showPublicConfirm} onOpenChange={setShowPublicConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Сделать заметку общей?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70">
              Общие заметки видны всем сотрудникам. Вы уверены, что хотите сделать эту заметку общей? 
              Вы работаете с приватными данными клиентки.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={addNote}>Да, сделать общей</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}