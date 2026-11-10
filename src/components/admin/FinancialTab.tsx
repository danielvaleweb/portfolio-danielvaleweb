import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  Film, 
  User, 
  Tag, 
  Check, 
  X, 
  CreditCard, 
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { 
  FinancialTransaction, 
  TransactionType, 
  TransactionStatus, 
  Project, 
  Client 
} from '../../types';
import { 
  getFinancialTransactions, 
  addFinancialTransaction, 
  updateFinancialTransaction, 
  deleteFinancialTransaction, 
  getProjects, 
  getClients 
} from '../../utils/storage';

interface FinancialTabProps {
  lang?: 'pt' | 'en';
}

const INCOME_CATEGORIES = [
  'Produção Audiovisual',
  'Filmagem Imobiliária',
  'Vídeo Institucional',
  'Cobertura de Evento',
  'Comercial / Publicidade',
  'Drone & Aéreo',
  'Ensaio Fotográfico',
  'Edição & Pós-Produção',
  'Outros Ganhos'
];

const EXPENSE_CATEGORIES = [
  'Equipamentos & Lentes',
  'Softwares & Assinaturas',
  'Transporte & Combustível',
  'Assistente / Segundo Operador',
  'Manutenção & Seguro',
  'Alimentação & Diárias',
  'Locação de Cenário / Estúdio',
  'Marketing & Tráfego Pago',
  'Impostos & Taxas',
  'Outras Contas'
];

const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#14B8A6'];

export const FinancialTab: React.FC<FinancialTabProps> = ({ lang = 'pt' }) => {
  const isPt = lang === 'pt';

  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'current_month' | 'last_30_days' | 'current_year'>('all');
  const [showCharts, setShowCharts] = useState(true);

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<FinancialTransaction | null>(null);

  // Form State para Nova / Editar Transação
  const [formType, setFormType] = useState<TransactionType>('income');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState(INCOME_CATEGORIES[0]);
  const [formStatus, setFormStatus] = useState<TransactionStatus>('paid');
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formClientId, setFormClientId] = useState<string>('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<'pix' | 'cartao' | 'transferencia' | 'boleto' | 'dinheiro' | 'outro'>('pix');
  const [formNotes, setFormNotes] = useState('');

  // Toast de feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    setTransactions(getFinancialTransactions());
    setProjects(getProjects());
    setClients(getClients());
  };

  useEffect(() => {
    loadData();

    const handleFinancialUpdate = () => {
      setTransactions(getFinancialTransactions());
    };
    const handleProjectsUpdate = () => {
      setProjects(getProjects());
    };
    const handleClientsUpdate = () => {
      setClients(getClients());
    };

    window.addEventListener('financial-updated', handleFinancialUpdate);
    window.addEventListener('projects-updated', handleProjectsUpdate);
    window.addEventListener('clients-updated', handleClientsUpdate);

    return () => {
      window.removeEventListener('financial-updated', handleFinancialUpdate);
      window.removeEventListener('projects-updated', handleProjectsUpdate);
      window.removeEventListener('clients-updated', handleClientsUpdate);
    };
  }, []);

  // Filtragem e busca de transações
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Filtro de Tipo
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Filtro de Status
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

      // Filtro de Categoria
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // Filtro de Período
      if (periodFilter !== 'all') {
        const txDate = new Date(tx.date + 'T00:00:00');
        const now = new Date();
        if (periodFilter === 'current_month') {
          if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (periodFilter === 'last_30_days') {
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays < 0 || diffDays > 30) return false;
        } else if (periodFilter === 'current_year') {
          if (txDate.getFullYear() !== now.getFullYear()) return false;
        }
      }

      // Busca por texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(term);
        const catMatch = tx.category.toLowerCase().includes(term);
        const projMatch = tx.projectTitle?.toLowerCase().includes(term);
        const clientMatch = tx.clientName?.toLowerCase().includes(term);
        const valMatch = tx.amount.toString().includes(term);
        if (!descMatch && !catMatch && !projMatch && !clientMatch && !valMatch) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, typeFilter, statusFilter, categoryFilter, periodFilter, searchTerm]);

  // Cálculos de KPIs
  const stats = useMemo(() => {
    let totalIncomePaid = 0;
    let totalExpensePaid = 0;
    let totalIncomePending = 0;
    let totalExpensePending = 0;

    filteredTransactions.forEach(tx => {
      if (tx.type === 'income') {
        if (tx.status === 'paid') totalIncomePaid += tx.amount;
        else totalIncomePending += tx.amount;
      } else {
        if (tx.status === 'paid') totalExpensePaid += tx.amount;
        else totalExpensePending += tx.amount;
      }
    });

    const netProfit = totalIncomePaid - totalExpensePaid;
    const profitMargin = totalIncomePaid > 0 ? (netProfit / totalIncomePaid) * 100 : 0;

    return {
      totalIncomePaid,
      totalExpensePaid,
      totalIncomePending,
      totalExpensePending,
      netProfit,
      profitMargin,
      countIncome: filteredTransactions.filter(t => t.type === 'income').length,
      countExpense: filteredTransactions.filter(t => t.type === 'expense').length,
    };
  }, [filteredTransactions]);

  // Dados para o Gráfico de Evolução Mensal (últimos 6 meses)
  const monthlyChartData = useMemo(() => {
    const monthsMap: Record<string, { month: string; receitas: number; despesas: number }> = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Inicializa últimos 6 meses
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsMap[key] = {
        month: `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
        receitas: 0,
        despesas: 0,
      };
    }

    transactions.forEach(tx => {
      if (tx.status === 'paid') {
        const key = tx.date.slice(0, 7); // YYYY-MM
        if (monthsMap[key]) {
          if (tx.type === 'income') monthsMap[key].receitas += tx.amount;
          else monthsMap[key].despesas += tx.amount;
        }
      }
    });

    return Object.values(monthsMap);
  }, [transactions]);

  // Dados para o Gráfico de Pizza (Despesas por Categoria)
  const expenseCategoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredTransactions
      .filter(tx => tx.type === 'expense' && tx.status === 'paid')
      .forEach(tx => {
        catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
      });

    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // Abertura do Modal de Cadastro / Edição
  const handleOpenModal = (tx?: FinancialTransaction, defaultType: TransactionType = 'income') => {
    if (tx) {
      setEditingTransaction(tx);
      setFormType(tx.type);
      setFormDescription(tx.description);
      setFormAmount(tx.amount.toString());
      setFormDate(tx.date);
      setFormCategory(tx.category);
      setFormStatus(tx.status);
      setFormProjectId(tx.projectId || '');
      setFormClientId(tx.clientId || '');
      setFormPaymentMethod(tx.paymentMethod || 'pix');
      setFormNotes(tx.notes || '');
    } else {
      setEditingTransaction(null);
      setFormType(defaultType);
      setFormDescription('');
      setFormAmount('');
      setFormDate(new Date().toISOString().split('T')[0]);
      setFormCategory(defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setFormStatus('paid');
      setFormProjectId('');
      setFormClientId('');
      setFormPaymentMethod('pix');
      setFormNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Por favor, informe um valor monetário válido maior que zero.');
      return;
    }
    if (!formDescription.trim()) {
      alert('Por favor, informe uma descrição para a transação.');
      return;
    }

    const linkedProj = projects.find(p => p.id === formProjectId);
    const linkedClient = clients.find(c => c.id === formClientId);

    if (editingTransaction) {
      updateFinancialTransaction(editingTransaction.id, {
        description: formDescription.trim(),
        amount: amountNum,
        type: formType,
        category: formCategory,
        date: formDate,
        status: formStatus,
        projectId: formProjectId || undefined,
        projectTitle: linkedProj?.title || undefined,
        clientId: formClientId || undefined,
        clientName: linkedClient?.name || undefined,
        paymentMethod: formPaymentMethod,
        notes: formNotes.trim() || undefined,
      });
      showToast('Transação financeira atualizada com sucesso!');
    } else {
      addFinancialTransaction({
        description: formDescription.trim(),
        amount: amountNum,
        type: formType,
        category: formCategory,
        date: formDate,
        status: formStatus,
        projectId: formProjectId || undefined,
        projectTitle: linkedProj?.title || undefined,
        clientId: formClientId || undefined,
        clientName: linkedClient?.name || undefined,
        paymentMethod: formPaymentMethod,
        notes: formNotes.trim() || undefined,
      });
      showToast(formType === 'income' ? 'Ganho registrado com sucesso!' : 'Despesa registrada com sucesso!');
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (tx: FinancialTransaction) => {
    const newStatus: TransactionStatus = tx.status === 'paid' ? 'pending' : 'paid';
    updateFinancialTransaction(tx.id, { status: newStatus });
    showToast(newStatus === 'paid' ? 'Marcado como Recebido / Pago!' : 'Marcado como Pendente.');
  };

  const handleDelete = () => {
    if (!transactionToDelete) return;
    deleteFinancialTransaction(transactionToDelete.id);
    setTransactionToDelete(null);
    showToast('Transação excluída do financeiro.');
  };

  // Exportar dados filtrados para CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Nenhuma transação encontrada no filtro atual para exportar.');
      return;
    }

    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Projeto', 'Cliente', 'Forma de Pagamento', 'Status', 'Valor (R$)'];
    const rows = filteredTransactions.map(tx => [
      tx.date,
      tx.type === 'income' ? 'Ganho (Receita)' : 'Despesa (Conta)',
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.category}"`,
      `"${(tx.projectTitle || '').replace(/"/g, '""')}"`,
      `"${(tx.clientName || '').replace(/"/g, '""')}"`,
      tx.paymentMethod || 'pix',
      tx.status === 'paid' ? 'Recebido/Pago' : 'Pendente',
      tx.amount.toFixed(2).replace('.', ',')
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_daniel_vale_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Relatório CSV exportado com sucesso!');
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="w-full flex-1 flex flex-col pb-12 font-sans space-y-6">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-[400] bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700 flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header com Botões de Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-200 dark:border-[#222] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Financeiro & Ganhos Videomaker
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#888]">
                Monitore receitas de projetos, despesas de produção e fluxo de caixa
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-[#333] hover:bg-gray-100 dark:hover:bg-[#222] text-xs font-bold text-gray-700 dark:text-[#ccc] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Exportar para Excel / CSV"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal(undefined, 'expense')}
            className="px-4 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <TrendingDown size={14} />
            <span>Nova Conta / Despesa</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal(undefined, 'income')}
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Novo Ganho</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs Financeiros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ganhos Confirmados */}
        <div className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-gray-200 dark:border-[#222] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#888]">Ganhos (Recebidos)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatBRL(stats.totalIncomePaid)}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-[#777] mt-1 flex items-center gap-1">
              <span>{stats.countIncome} entradas registradas</span>
            </div>
          </div>
        </div>

        {/* Card 2: Contas e Custos */}
        <div className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-gray-200 dark:border-[#222] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#888]">Despesas / Custos</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">
              {formatBRL(stats.totalExpensePaid)}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-[#777] mt-1 flex items-center gap-1">
              <span>{stats.countExpense} despesas pagas</span>
            </div>
          </div>
        </div>

        {/* Card 3: Lucro Líquido */}
        <div className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-gray-200 dark:border-[#222] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#888]">Lucro Líquido Real</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight ${stats.netProfit >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
              {formatBRL(stats.netProfit)}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-[#777] mt-1 flex items-center gap-1">
              <span className={`font-semibold ${stats.profitMargin >= 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {stats.profitMargin.toFixed(0)}% margem líquida
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Pendências (A Receber / A Pagar) */}
        <div className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-gray-200 dark:border-[#222] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#888]">A Receber / Pendente</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-500 tracking-tight">
              {formatBRL(stats.totalIncomePending)}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-[#777] mt-1 flex items-center justify-between">
              <span>Projetos em aberto</span>
              {stats.totalExpensePending > 0 && (
                <span className="text-red-400 font-semibold">A Pagar: {formatBRL(stats.totalExpensePending)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos Recharts (Colapsável) */}
      <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-200 dark:border-[#222] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart size={18} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Análise Gráfica (Videomaker Analytics)</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowCharts(prev => !prev)}
            className="text-xs font-semibold text-gray-500 hover:text-black dark:text-[#888] dark:hover:text-white transition-colors cursor-pointer"
          >
            {showCharts ? 'Ocultar Gráficos' : 'Exibir Gráficos'}
          </button>
        </div>

        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Gráfico 1: Comparativo Mensal */}
            <div className="lg:col-span-2 h-[260px] w-full">
              <p className="text-xs text-gray-500 dark:text-[#777] mb-2 font-medium">Evolução Mensal: Receitas vs Despesas (Últimos 6 meses)</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickFormatter={(val) => `R$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [formatBRL(Number(value)), '']}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="receitas" name="Ganhos" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico 2: Distribuição de Despesas */}
            <div className="h-[260px] w-full flex flex-col items-center">
              <p className="text-xs text-gray-500 dark:text-[#777] mb-1 font-medium w-full text-left">Distribuição de Despesas</p>
              {expenseCategoryData.length > 0 ? (
                <div className="w-full h-full">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {expenseCategoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [formatBRL(Number(value)), '']}
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-2 text-[10px] text-gray-500 dark:text-[#888] overflow-hidden max-h-[48px]">
                    {expenseCategoryData.slice(0, 4).map((entry, idx) => (
                      <span key={idx} className="flex items-center gap-1 truncate">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        {entry.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-gray-400 p-4">
                  <Receipt size={24} className="mb-1 opacity-40" />
                  Nenhuma despesa registrada para exibir distribuição
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white dark:bg-[#111] p-4 rounded-3xl border border-gray-200 dark:border-[#222] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição, projeto, cliente ou valor..."
            className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Período */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-[#ccc] focus:outline-none cursor-pointer"
          >
            <option value="all">Todo o Período</option>
            <option value="current_month">Mês Atual</option>
            <option value="last_30_days">Últimos 30 Dias</option>
            <option value="current_year">Ano de {new Date().getFullYear()}</option>
          </select>

          {/* Filtro Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-[#ccc] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Tipos</option>
            <option value="income">Apenas Ganhos</option>
            <option value="expense">Apenas Despesas</option>
          </select>

          {/* Filtro Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl px-3 py-2 text-xs font-semibold text-gray-700 dark:text-[#ccc] focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="paid">Confirmados (Pagos / Recebidos)</option>
            <option value="pending">Pendentes</option>
          </select>
        </div>
      </div>

      {/* Tabela / Lista de Transações */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-[#222] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#222] flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Transações ({filteredTransactions.length})
          </span>
          <span className="text-[11px] text-gray-400">
            Coleção: <code className="text-emerald-500 font-mono">financial_transactions</code>
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center text-gray-400">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-white">Nenhuma transação encontrada</p>
              <p className="text-xs text-gray-500 dark:text-[#777] mt-0.5">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Nenhum resultado com os filtros selecionados.'
                  : 'Comece registrando os ganhos dos seus projetos ou as contas de produção.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenModal(undefined, 'income')}
              className="mt-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Registrar Primeiro Ganho
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#1a1a1a] overflow-x-auto">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isPaid = tx.status === 'paid';

              return (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 dark:hover:bg-[#161616] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Ícone de Entrada / Saída */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {tx.description}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-[#aaa]">
                          {tx.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-[#777] mt-1 flex-wrap">
                        <span>{new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>

                        {tx.projectTitle && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium truncate">
                            <Film size={11} /> {tx.projectTitle}
                          </span>
                        )}

                        {tx.clientName && (
                          <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium truncate">
                            <User size={11} /> {tx.clientName}
                          </span>
                        )}

                        <span className="uppercase font-mono text-[10px] tracking-wider text-gray-400">
                          {tx.paymentMethod || 'PIX'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    {/* Botão de Toggle de Status */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(tx)}
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                      }`}
                      title={isPaid ? "Clique para marcar como Pendente" : "Clique para marcar como Recebido/Pago"}
                    >
                      {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span>{isPaid ? (isIncome ? 'Recebido' : 'Pago') : 'Pendente'}</span>
                    </button>

                    {/* Valor Monetário */}
                    <div className="text-right min-w-[110px]">
                      <span
                        className={`text-base font-black tracking-tight ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}
                        {formatBRL(tx.amount)}
                      </span>
                    </div>

                    {/* Ações (Editar e Deletar) */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(tx, tx.type)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
                        title="Editar transação"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setTransactionToDelete(tx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Excluir transação"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Nova / Editar Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[350] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative text-neutral-900 dark:text-neutral-100"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#222]">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    formType === 'income'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {formType === 'income' ? <ArrowUpRight size={18} strokeWidth={2.5} /> : <ArrowDownRight size={18} strokeWidth={2.5} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingTransaction ? 'Editar Transação Financeira' : (formType === 'income' ? 'Novo Ganho / Receita' : 'Nova Conta / Despesa')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#888]">
                    Registrar na coleção <code className="text-emerald-500">financial_transactions</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 pt-4">
              {/* Seletor Tipo: Ganho vs Despesa */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a]">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('income');
                    if (!editingTransaction) setFormCategory(INCOME_CATEGORIES[0]);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formType === 'income'
                      ? 'bg-white dark:bg-[#252525] text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-gray-500 dark:text-[#888] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <TrendingUp size={14} />
                  <span>+ Ganho (Receita)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormType('expense');
                    if (!editingTransaction) setFormCategory(EXPENSE_CATEGORIES[0]);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    formType === 'expense'
                      ? 'bg-white dark:bg-[#252525] text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-gray-500 dark:text-[#888] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <TrendingDown size={14} />
                  <span>- Conta (Despesa)</span>
                </button>
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">
                  Descrição da Transação *
                </label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={formType === 'income' ? 'Ex: Produção de Vídeo - Casa AlphaVille' : 'Ex: Licença Adobe Creative Cloud ou Lente 24-70mm'}
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Valor e Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">
                    Valor (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Categoria e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">
                    Categoria
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {(formType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">
                    Status do Pagamento
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TransactionStatus)}
                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="paid">{formType === 'income' ? '✓ Já Recebido (No Caixa)' : '✓ Já Pago (Quitado)'}</option>
                    <option value="pending">{formType === 'income' ? '⏳ A Receber (Pendente)' : '⏳ A Pagar (Agendado)'}</option>
                  </select>
                </div>
              </div>

              {/* Vincular Projeto e Cliente (Opcional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center gap-1">
                    <Film size={11} /> Vincular Projeto (Opcional)
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      setFormProjectId(pId);
                      const proj = projects.find(p => p.id === pId);
                      if (proj?.clientId) {
                        setFormClientId(proj.clientId);
                      }
                      if (!formDescription.trim() && proj) {
                        setFormDescription(`Produção de Vídeo - ${proj.title}`);
                      }
                    }}
                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Nenhum projeto vinculado</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center gap-1">
                    <User size={11} /> Vincular Cliente (Opcional)
                  </label>
                  <select
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Nenhum cliente vinculado</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center gap-1">
                  <CreditCard size={11} /> Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(['pix', 'cartao', 'transferencia', 'boleto', 'dinheiro', 'outro'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setFormPaymentMethod(method)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer border ${
                        formPaymentMethod === method
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-transparent shadow-xs'
                          : 'bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 dark:text-[#888] border-gray-200 dark:border-[#333] hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-[#333] text-xs font-bold text-gray-600 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-full text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
                    formType === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                  }`}
                >
                  {editingTransaction ? 'Atualizar Transação' : (formType === 'income' ? 'Salvar Ganho' : 'Salvar Despesa')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-[360] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#222] rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Excluir Transação?</h3>
              <p className="text-xs text-gray-500 dark:text-[#888] mt-1">
                Deseja remover <strong>"{transactionToDelete.description}"</strong> no valor de {formatBRL(transactionToDelete.amount)}?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-300 dark:border-[#333] text-xs font-bold text-gray-600 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
