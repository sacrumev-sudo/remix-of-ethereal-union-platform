import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, getPrograms } from '@/lib/storage';
import { formatDateRu } from '@/lib/utils';
import SearchInput from '@/components/SearchInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, X, Users, CreditCard, TrendingUp, Plus, Pencil, Trash2, CalendarIcon, Minus, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ru } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ============ UNIFIED TRANSACTION TYPE ============
export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'card' | 'cash' | 'transfer' | 'installment';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  programId?: string;
  clientId?: string;
  clientName?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
}

const STORAGE_KEY = 'ek_finance_transactions';

// Categories
const INCOME_CATEGORIES = ['Продажа курса', 'Консультация', 'Интенсив', 'Рассрочка', 'Другое'];
const EXPENSE_CATEGORIES = ['Маркетинг', 'Контент', 'Сервисы', 'Налоги', 'Подрядчики', 'Прочее'];
const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: 'Карта' },
  { value: 'cash', label: 'Наличные' },
  { value: 'transfer', label: 'Перевод' },
  { value: 'installment', label: 'Рассрочка' },
];

const PIE_COLORS = ['#3b82f6', '#a855f7', '#22c55e', '#ef4444', '#f97316', '#6b7280', '#eab308', '#06b6d4'];

// ============ STORAGE HELPERS ============
function getTransactions(): FinanceTransaction[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data) ?? [];
  }
  // Initialize with seed data
  const seed = generateSeedTransactions();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function setTransactions(transactions: FinanceTransaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function addTransaction(tx: Omit<FinanceTransaction, 'id'>): FinanceTransaction {
  const transactions = getTransactions();
  const newTx: FinanceTransaction = { ...tx, id: `tx-${Date.now()}` };
  transactions.push(newTx);
  setTransactions(transactions);
  return newTx;
}

function updateTransaction(id: string, updates: Partial<FinanceTransaction>): FinanceTransaction | null {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    setTransactions(transactions);
    return transactions[index];
  }
  return null;
}

function deleteTransaction(id: string) {
  const transactions = getTransactions();
  setTransactions(transactions.filter(t => t.id !== id));
}

// Generate seed data from existing payments/expenses
function generateSeedTransactions(): FinanceTransaction[] {
  const transactions: FinanceTransaction[] = [];
  
  // Sample income transactions
  transactions.push(
    { id: 'tx-1', type: 'income', date: '2025-01-10', amount: 45000, category: 'Продажа курса', programId: 'program-1', clientId: 'student-1', clientName: 'Анна Соколова' },
    { id: 'tx-2', type: 'income', date: '2025-01-05', amount: 7000, category: 'Интенсив', programId: 'program-2', clientId: 'student-2', clientName: 'Мария Иванова', paymentMethod: 'card' },
    { id: 'tx-3', type: 'income', date: '2024-12-20', amount: 15000, category: 'Рассрочка', programId: 'program-1', clientId: 'student-3', clientName: 'Елена Петрова', paymentMethod: 'installment', note: 'Осталось 30000' },
    { id: 'tx-4', type: 'income', date: '2024-12-15', amount: 45000, category: 'Продажа курса', programId: 'program-1', clientId: 'student-4', clientName: 'Ольга Козлова', paymentMethod: 'transfer' },
    { id: 'tx-5', type: 'income', date: '2025-01-12', amount: 25000, category: 'Консультация', clientName: 'Светлана Новикова', paymentMethod: 'card' },
    { id: 'tx-6', type: 'income', date: '2025-01-08', amount: 20000, category: 'Рассрочка', programId: 'program-1', clientId: 'student-2', clientName: 'Мария Иванова', paymentMethod: 'installment', note: 'Осталось 25000' },
  );
  
  // Sample expense transactions
  transactions.push(
    { id: 'tx-e1', type: 'expense', date: '2025-01-10', amount: 15000, category: 'Маркетинг', note: 'Таргетированная реклама VK' },
    { id: 'tx-e2', type: 'expense', date: '2025-01-05', amount: 5000, category: 'Сервисы', note: 'Kinescope подписка' },
    { id: 'tx-e3', type: 'expense', date: '2024-12-20', amount: 20000, category: 'Контент', programId: 'program-1', note: 'Видеопродакшн для курса' },
    { id: 'tx-e4', type: 'expense', date: '2024-12-15', amount: 8000, category: 'Маркетинг', note: 'Telegram Ads' },
    { id: 'tx-e5', type: 'expense', date: '2024-11-28', amount: 12000, category: 'Подрядчики', programId: 'program-3', note: 'Дизайнер обложек' },
    { id: 'tx-e6', type: 'expense', date: '2024-11-15', amount: 35000, category: 'Налоги', note: 'Налог УСН' },
    { id: 'tx-e7', type: 'expense', date: '2025-01-15', amount: 3500, category: 'Сервисы', note: 'GetCourse подписка' },
    { id: 'tx-e8', type: 'expense', date: '2024-10-20', amount: 10000, category: 'Контент', programId: 'program-2', note: 'Копирайтер' },
  );
  
  return transactions;
}

type SortField = 'date' | 'client' | 'amount';
type SortDirection = 'asc' | 'desc';
type TypeFilter = 'all' | 'income' | 'expense';

export default function AdminFinance() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const transactions = useMemo(() => getTransactions(), [refreshKey]);
  const users = getUsers();
  const programs = getPrograms();
  
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [activeTab, setActiveTab] = useState<'transactions' | 'reports'>('transactions');
  
  // Add/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);
  const [formType, setFormType] = useState<TransactionType>('income');
  const [form, setForm] = useState({
    date: new Date(),
    amount: '',
    category: '',
    customCategory: '',
    programId: '',
    clientId: '',
    clientName: '',
    note: '',
    paymentMethod: '' as PaymentMethod | '',
  });
  
  // Program report state
  const [selectedProgramReport, setSelectedProgramReport] = useState<string | null>(null);

  // Filter transactions by date range
  const filteredByDate = useMemo(() => {
    return (transactions ?? []).filter(tx => {
      if (dateFrom && new Date(tx.date) < dateFrom) return false;
      if (dateTo) {
        const toDateEnd = new Date(dateTo);
        toDateEnd.setHours(23, 59, 59, 999);
        if (new Date(tx.date) > toDateEnd) return false;
      }
      return true;
    });
  }, [transactions, dateFrom, dateTo]);

  // Calculate statistics based on date-filtered transactions
  const stats = useMemo(() => {
    const incomeTransactions = filteredByDate.filter(tx => tx.type === 'income');
    const expenseTransactions = filteredByDate.filter(tx => tx.type === 'expense');
    
    const totalIncome = incomeTransactions.reduce((s, tx) => s + tx.amount, 0);
    const totalExpenses = expenseTransactions.reduce((s, tx) => s + tx.amount, 0);
    
    const uniqueBuyerIds = new Set(
      incomeTransactions
        .filter(tx => tx.clientId)
        .map(tx => tx.clientId)
    );
    
    return {
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      buyersCount: uniqueBuyerIds.size,
    };
  }, [filteredByDate]);

  // Filter and sort transactions for table
  const filteredTransactions = useMemo(() => {
    return filteredByDate.filter(tx => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      
      // Search
      if (search) {
        const searchLower = search.toLowerCase().trim();
        const program = programs.find(p => p.id === tx.programId);
        const matchesSearch = 
          tx.category.toLowerCase().includes(searchLower) ||
          tx.clientName?.toLowerCase().includes(searchLower) ||
          tx.note?.toLowerCase().includes(searchLower) ||
          program?.title?.toLowerCase().includes(searchLower) ||
          tx.amount.toString().includes(search) ||
          formatDateRu(tx.date).includes(search);
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [filteredByDate, typeFilter, search, programs]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'client':
          comparison = (a.clientName || '').localeCompare(b.clientName || '', 'ru');
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTransactions, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const clearFilters = () => {
    setSearch('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setTypeFilter('all');
  };

  const hasFilters = search || dateFrom || dateTo || typeFilter !== 'all';

  // Handle KPI card clicks
  const handleIncomeClick = () => {
    setActiveTab('transactions');
    setTypeFilter('income');
  };

  const handleExpenseClick = () => {
    setActiveTab('transactions');
    setTypeFilter('expense');
  };

  const handleProfitClick = () => {
    setActiveTab('reports');
  };

  const handleBuyersClick = () => {
    setActiveTab('transactions');
    setTypeFilter('income');
  };

  // Form handlers
  const resetForm = () => {
    setForm({
      date: new Date(),
      amount: '',
      category: '',
      customCategory: '',
      programId: '',
      clientId: '',
      clientName: '',
      note: '',
      paymentMethod: '',
    });
    setEditingTx(null);
    setFormType('income');
  };

  const openAddDialog = () => {
    resetForm();
    setFormType(typeFilter === 'expense' ? 'expense' : 'income');
    setDialogOpen(true);
  };

  const handleEdit = (tx: FinanceTransaction) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setForm({
      date: new Date(tx.date),
      amount: tx.amount.toString(),
      category: tx.category,
      customCategory: '',
      programId: tx.programId || '',
      clientId: tx.clientId || '',
      clientName: tx.clientName || '',
      note: tx.note || '',
      paymentMethod: tx.paymentMethod || '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.amount) {
      toast.error('Укажите сумму');
      return;
    }
    
    const category = form.customCategory || form.category;
    if (!category) {
      toast.error('Выберите или введите категорию');
      return;
    }
    
    const txData: Omit<FinanceTransaction, 'id'> = {
      type: formType,
      date: format(form.date, 'yyyy-MM-dd'),
      amount: parseFloat(form.amount),
      category,
      programId: form.programId || undefined,
      clientId: form.clientId || undefined,
      clientName: form.clientName || undefined,
      note: form.note || undefined,
      paymentMethod: (form.paymentMethod as PaymentMethod) || undefined,
    };
    
    if (editingTx) {
      updateTransaction(editingTx.id, txData);
      toast.success(formType === 'income' ? 'Доход обновлён' : 'Расход обновлён');
    } else {
      addTransaction(txData);
      toast.success(formType === 'income' ? 'Доход добавлен' : 'Расход добавлен');
    }
    
    setDialogOpen(false);
    resetForm();
    setRefreshKey(k => k + 1);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success('Запись удалена');
    setRefreshKey(k => k + 1);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Дата', 'Тип', 'Категория', 'Клиент', 'Программа', 'Сумма', 'Способ оплаты', 'Примечание'];
    const rows = sortedTransactions.map(tx => {
      const program = programs.find(p => p.id === tx.programId);
      return [
        formatDateRu(tx.date),
        tx.type === 'income' ? 'Доход' : 'Расход',
        tx.category,
        tx.clientName || '-',
        program?.title || '-',
        tx.type === 'income' ? tx.amount.toString() : `-${tx.amount}`,
        PAYMENT_METHODS.find(m => m.value === tx.paymentMethod)?.label || '-',
        tx.note || '-'
      ];
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(';'))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Charts data
  const expensesByCategoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    filteredByDate
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      });
    
    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
  }, [filteredByDate]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expenses: number }> = {};
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = format(date, 'MM.yyyy');
      months[key] = { income: 0, expenses: 0 };
    }
    
    (transactions ?? []).forEach(tx => {
      const key = format(new Date(tx.date), 'MM.yyyy');
      if (months[key]) {
        if (tx.type === 'income') {
          months[key].income += tx.amount;
        } else {
          months[key].expenses += tx.amount;
        }
      }
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      'Доходы': data.income,
      'Расходы': data.expenses,
      'Прибыль': data.income - data.expenses,
    }));
  }, [transactions]);

  // Program report data
  const programReportData = useMemo(() => {
    if (!selectedProgramReport) return null;
    
    const program = programs.find(p => p.id === selectedProgramReport);
    if (!program) return null;
    
    const programTxs = (transactions ?? []).filter(tx => tx.programId === selectedProgramReport);
    const incomes = programTxs.filter(tx => tx.type === 'income');
    const expenses = programTxs.filter(tx => tx.type === 'expense');
    
    const totalIncome = incomes.reduce((s, tx) => s + tx.amount, 0);
    const totalExpenses = expenses.reduce((s, tx) => s + tx.amount, 0);
    
    return {
      program,
      incomes,
      expenses,
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
      buyersCount: new Set(incomes.filter(tx => tx.clientId).map(tx => tx.clientId)).size,
    };
  }, [selectedProgramReport, programs, transactions]);

  const currentCategories = formType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">Финансы</h1>
      
      {/* Statistics Cards - CLICKABLE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div 
          onClick={handleIncomeClick}
          className={cn(
            "premium-card cursor-pointer transition-all hover:scale-[1.02]",
            activeTab === 'transactions' && typeFilter === 'income' && "ring-2 ring-gold bg-gold/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold/10">
              <TrendingUp className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Доходы</p>
              <p className="text-xl font-bold text-gold">{stats.totalIncome.toLocaleString()} ₽</p>
            </div>
          </div>
          {activeTab === 'transactions' && typeFilter === 'income' && (
            <p className="text-xs text-gold mt-2">✓ Фильтр активен</p>
          )}
        </div>
        
        <div 
          onClick={handleExpenseClick}
          className={cn(
            "premium-card cursor-pointer transition-all hover:scale-[1.02]",
            activeTab === 'transactions' && typeFilter === 'expense' && "ring-2 ring-red-500 bg-red-500/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <Minus className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Расходы</p>
              <p className="text-xl font-bold text-red-500">{stats.totalExpenses.toLocaleString()} ₽</p>
            </div>
          </div>
          {activeTab === 'transactions' && typeFilter === 'expense' && (
            <p className="text-xs text-red-500 mt-2">✓ Фильтр активен</p>
          )}
        </div>
        
        <div 
          onClick={handleProfitClick}
          className={cn(
            "premium-card cursor-pointer transition-all hover:scale-[1.02]",
            activeTab === 'reports' && "ring-2 ring-green-500 bg-green-500/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Чистая прибыль</p>
              <p className={cn("text-xl font-bold", stats.profit >= 0 ? "text-green-500" : "text-red-500")}>
                {stats.profit.toLocaleString()} ₽
              </p>
            </div>
          </div>
          {activeTab === 'reports' && (
            <p className="text-xs text-green-500 mt-2">✓ Отчёты</p>
          )}
        </div>
        
        <div 
          onClick={handleBuyersClick}
          className={cn(
            "premium-card cursor-pointer transition-all hover:scale-[1.02]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Покупатели</p>
              <p className="text-xl font-bold text-foreground">{stats.buyersCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="transactions" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Операции
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Отчёты
          </TabsTrigger>
        </TabsList>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="mt-4">
          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Добавить
            </Button>
            
            {/* Type filter chips */}
            <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTypeFilter('all')}
                className="h-7"
              >
                Все
              </Button>
              <Button
                variant={typeFilter === 'income' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTypeFilter('income')}
                className={cn("h-7", typeFilter === 'income' && "bg-green-600 hover:bg-green-700")}
              >
                Доходы
              </Button>
              <Button
                variant={typeFilter === 'expense' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTypeFilter('expense')}
                className={cn("h-7", typeFilter === 'expense' && "bg-red-600 hover:bg-red-700")}
              >
                Расходы
              </Button>
            </div>
            
            <div className="flex-1" />
            
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Экспорт CSV
            </Button>
          </div>
          
          {/* Search and date filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Поиск по категории, клиенту, программе..."
              className="flex-1 min-w-[200px]"
            />
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Период:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[130px] justify-start text-left font-normal h-9">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'dd.MM.yyyy') : 'С...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    locale={ru}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">—</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[130px] justify-start text-left font-normal h-9">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'dd.MM.yyyy') : 'По...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    locale={ru}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Сбросить
              </Button>
            )}
          </div>

          {/* Unified table */}
          <div className="overflow-x-auto premium-card p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th 
                    className="text-left py-3 px-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <span className="flex items-center">
                      Дата {getSortIcon('date')}
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Тип</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Категория</th>
                  <th className="text-left py-3 px-4 text-muted-foreground">Программа</th>
                  <th 
                    className="text-left py-3 px-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('client')}
                  >
                    <span className="flex items-center">
                      Клиент {getSortIcon('client')}
                    </span>
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('amount')}
                  >
                    <span className="flex items-center">
                      Сумма {getSortIcon('amount')}
                    </span>
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground w-20">Действия</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Операции не найдены
                    </td>
                  </tr>
                ) : (
                  sortedTransactions.map(tx => {
                    const program = programs.find(p => p.id === tx.programId);
                    
                    return (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">{formatDateRu(tx.date)}</td>
                        <td className="py-3 px-4">
                          {tx.type === 'income' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Доход
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              Расход
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{tx.category}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {program?.title || '—'}
                        </td>
                        <td className="py-3 px-4">
                          {tx.clientId ? (
                            <Link 
                              to={`/admin/clients/${tx.clientId}`}
                              className="hover:text-gold transition-colors"
                            >
                              {tx.clientName}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">{tx.clientName || '—'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {tx.type === 'income' ? (
                            <span className="text-green-600 font-medium">+{tx.amount.toLocaleString()} ₽</span>
                          ) : (
                            <span className="text-red-500 font-medium">−{tx.amount.toLocaleString()} ₽</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(tx)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(tx.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 premium-card">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <span className="text-muted-foreground">Итого доходов:</span>{' '}
                <span className="font-bold text-green-600">
                  +{filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0).toLocaleString()} ₽
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Итого расходов:</span>{' '}
                <span className="font-bold text-red-500">
                  −{filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0).toLocaleString()} ₽
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Баланс:</span>{' '}
                <span className={cn("font-bold", 
                  filteredTransactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0) >= 0 
                    ? "text-green-600" 
                    : "text-red-500"
                )}>
                  {filteredTransactions.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0).toLocaleString()} ₽
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* REPORTS TAB */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly dynamics chart */}
            <div className="premium-card">
              <h3 className="font-display text-lg text-foreground mb-4">Динамика по месяцам</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `${value.toLocaleString()} ₽`}
                    />
                    <Legend />
                    <Bar dataKey="Доходы" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Расходы" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense distribution pie chart */}
            <div className="premium-card">
              <h3 className="font-display text-lg text-foreground mb-4">Расходы по категориям</h3>
              <div className="h-[300px]">
                {expensesByCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesByCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {expensesByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => `${value.toLocaleString()} ₽`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Нет данных о расходах
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Program reports */}
          <div className="premium-card">
            <h3 className="font-display text-lg text-foreground mb-4">Отчёт по программе</h3>
            
            <div className="flex gap-4 mb-4">
              <Select value={selectedProgramReport || ''} onValueChange={setSelectedProgramReport}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Выберите программу" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {programReportData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10">
                    <p className="text-sm text-muted-foreground">Доходы</p>
                    <p className="text-xl font-bold text-green-500">{programReportData.totalIncome.toLocaleString()} ₽</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-500/10">
                    <p className="text-sm text-muted-foreground">Расходы</p>
                    <p className="text-xl font-bold text-red-500">{programReportData.totalExpenses.toLocaleString()} ₽</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gold/10">
                    <p className="text-sm text-muted-foreground">Прибыль</p>
                    <p className={cn("text-xl font-bold", programReportData.profit >= 0 ? "text-gold" : "text-red-500")}>
                      {programReportData.profit.toLocaleString()} ₽
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Покупатели</p>
                    <p className="text-xl font-bold text-primary">{programReportData.buyersCount}</p>
                  </div>
                </div>

                {programReportData.incomes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Продажи ({programReportData.incomes.length})</h4>
                    <div className="space-y-1">
                      {programReportData.incomes.slice(0, 5).map(tx => (
                        <div key={tx.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                          <span>{formatDateRu(tx.date)} — {tx.clientName || 'Неизвестный'}</span>
                          <span className="text-green-500">+{tx.amount.toLocaleString()} ₽</span>
                        </div>
                      ))}
                      {programReportData.incomes.length > 5 && (
                        <p className="text-sm text-muted-foreground">...и ещё {programReportData.incomes.length - 5}</p>
                      )}
                    </div>
                  </div>
                )}

                {programReportData.expenses.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Расходы ({programReportData.expenses.length})</h4>
                    <div className="space-y-1">
                      {programReportData.expenses.map(tx => (
                        <div key={tx.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                          <span>{formatDateRu(tx.date)} — {tx.note || tx.category}</span>
                          <span className="text-red-500">−{tx.amount.toLocaleString()} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Выберите программу для просмотра отчёта</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTx ? 'Редактировать операцию' : 'Новая операция'}</DialogTitle>
          </DialogHeader>
          
          {/* Type selector */}
          <div className="flex gap-1 border rounded-lg p-1 bg-muted/30">
            <Button
              type="button"
              variant={formType === 'income' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFormType('income')}
              className={cn("flex-1", formType === 'income' && "bg-green-600 hover:bg-green-700")}
            >
              Доход
            </Button>
            <Button
              type="button"
              variant={formType === 'expense' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFormType('expense')}
              className={cn("flex-1", formType === 'expense' && "bg-red-600 hover:bg-red-700")}
            >
              Расход
            </Button>
          </div>
          
          <div className="space-y-4 py-2">
            {/* Date */}
            <div className="space-y-2">
              <Label>Дата</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(form.date, 'dd.MM.yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={form.date}
                    onSelect={(date) => date && setForm(f => ({ ...f, date }))}
                    locale={ru}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Amount */}
            <div className="space-y-2">
              <Label>Сумма (₽) *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="10000"
              />
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label>Категория *</Label>
              <Select 
                value={form.category} 
                onValueChange={(v) => setForm(f => ({ ...f, category: v, customCategory: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={form.customCategory}
                onChange={(e) => setForm(f => ({ ...f, customCategory: e.target.value, category: '' }))}
                placeholder="Или введите свою категорию..."
                className="mt-1"
              />
            </div>
            
            {/* Program */}
            <div className="space-y-2">
              <Label>Программа</Label>
              <Select 
                value={form.programId} 
                onValueChange={(v) => setForm(f => ({ ...f, programId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Не привязана" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Не привязана</SelectItem>
                  {programs.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Client (for income) */}
            {formType === 'income' && (
              <div className="space-y-2">
                <Label>Клиент</Label>
                <Select 
                  value={form.clientId} 
                  onValueChange={(v) => {
                    const user = users.find(u => u.id === v);
                    setForm(f => ({ 
                      ...f, 
                      clientId: v, 
                      clientName: user?.name || '' 
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Не указан</SelectItem>
                    {users.filter(u => u.role === 'student').map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={form.clientName}
                  onChange={(e) => setForm(f => ({ ...f, clientName: e.target.value, clientId: '' }))}
                  placeholder="Или введите имя вручную..."
                  className="mt-1"
                />
              </div>
            )}
            
            {/* Payment method (for income) */}
            {formType === 'income' && (
              <div className="space-y-2">
                <Label>Способ оплаты</Label>
                <Select 
                  value={form.paymentMethod} 
                  onValueChange={(v) => setForm(f => ({ ...f, paymentMethod: v as PaymentMethod }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Не указан" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Не указан</SelectItem>
                    {PAYMENT_METHODS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Note */}
            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea
                value={form.note}
                onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Дополнительная информация..."
                rows={2}
              />
            </div>
            
            <Button onClick={handleSave} className="w-full">
              {editingTx ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
