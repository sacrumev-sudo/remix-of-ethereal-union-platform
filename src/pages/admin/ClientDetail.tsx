import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById, getUserAccess, getUserPayments, getUserNotes, getPrograms, grantAccess, revokeAccess, addAdminNote } from '@/lib/storage';
import { formatDateRu } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Eye, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminClientDetail() {
  const { userId } = useParams();
  const { user: adminUser, startImpersonation } = useAuth();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'public' | 'private'>('public');
  const [selectedProgram, setSelectedProgram] = useState('');

  const client = userId ? getUserById(userId) : null;
  const isAdmin = adminUser?.role === 'admin';
  
  if (!client) {
    return <div className="text-center py-12">Клиент не найден</div>;
  }

  const access = getUserAccess(client.id);
  const payments = getUserPayments(client.id);
  const notes = getUserNotes(client.id, isAdmin);
  const programs = getPrograms();
  const accessibleProgramIds = access.map(a => a.programId);

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
    addAdminNote({ userId: client.id, type: noteType, content: newNote.trim(), createdBy: adminUser.id });
    toast.success('Заметка добавлена');
    setNewNote('');
    window.location.reload();
  };

  return (
    <div>
      <Link to="/admin/clients" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Клиентки
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-foreground">{client.name || 'Без имени'}</h1>
          <p className="text-muted-foreground">{client.email}</p>
          {client.telegramUsername && (
            <a href={`https://t.me/${client.telegramUsername}`} target="_blank" className="text-gold text-sm flex items-center gap-1 mt-1">
              @{client.telegramUsername} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <Button onClick={handleImpersonate} className="gap-2 bg-gold hover:bg-gold-dark text-primary-foreground">
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
                  <div key={a.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{prog?.title}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRevokeAccess(a.programId)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-muted-foreground text-sm mb-4">Нет доступов</p>}
          
          <div className="flex gap-2">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Выберите программу" /></SelectTrigger>
              <SelectContent>
                {programs.filter(p => !accessibleProgramIds.includes(p.id)).map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGrantAccess} disabled={!selectedProgram}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Payments */}
        <div className="premium-card">
          <h3 className="font-display text-lg text-foreground mb-4">Оплаты</h3>
          {payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                  <span>{programs.find(pr => pr.id === p.programId)?.title}</span>
                  <span className="text-gold">{p.amount.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm">Нет оплат</p>}
        </div>

        {/* Notes */}
        <div className="premium-card lg:col-span-2">
          <h3 className="font-display text-lg text-foreground mb-4">Заметки</h3>
          <div className="space-y-3 mb-4">
            {notes.map(n => (
              <div key={n.id} className={`p-3 rounded ${n.type === 'private' ? 'bg-gold/10 border border-gold/30' : 'bg-muted'}`}>
                <p className="text-sm">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDateRu(n.createdAt)} {n.type === 'private' && '(приватная)'}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Новая заметка..." className="flex-1" rows={2} />
            <div className="flex flex-col gap-2">
              {isAdmin && (
                <Select value={noteType} onValueChange={(v) => setNoteType(v as 'public' | 'private')}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Общая</SelectItem>
                    <SelectItem value="private">Приватная</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleAddNote}>Добавить</Button>
            </div>
          </div>
        </div>

        {/* Questionnaire - Admin only */}
        {isAdmin && client.questionnaire && (
          <div className="premium-card lg:col-span-2">
            <h3 className="font-display text-lg text-foreground mb-4">Анкета</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {Object.entries(client.questionnaire).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-muted-foreground capitalize">{key}</p>
                  <p className="text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
