import React from 'react';
import { DollarSign, Wallet, TrendingUp, Receipt, Clock, Sparkles, ArrowUpRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';

interface FinancialTabProps {
  lang?: 'pt' | 'en';
}

export const FinancialTab: React.FC<FinancialTabProps> = ({ lang = 'pt' }) => {
  const isPt = lang === 'pt';

  const upcomingFeatures = [
    {
      icon: TrendingUp,
      title: isPt ? 'Fluxo de Caixa & Faturamento' : 'Cash Flow & Revenue',
      desc: isPt
        ? 'Acompanhamento em tempo real de entradas, saídas e faturamento por projeto ou período.'
        : 'Real-time tracking of revenue, expenses, and turnover by project or period.',
      color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20',
      badge: isPt ? 'Em breve' : 'Coming Soon'
    },
    {
      icon: Receipt,
      title: isPt ? 'Contratos, Parcelas & Cobrança' : 'Contracts & Installments',
      desc: isPt
        ? 'Controle de pagamentos de clientes, parcelamentos e lembretes automáticos.'
        : 'Client payment tracking, installments, and automated billing reminders.',
      color: 'from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20',
      badge: isPt ? 'Em breve' : 'Coming Soon'
    },
    {
      icon: Wallet,
      title: isPt ? 'Orçamentos & Propostas' : 'Budgets & Proposals',
      desc: isPt
        ? 'Criação e envio de orçamentos cinematográficos integrados ao WhatsApp do cliente.'
        : 'Creation and direct sending of cinematic budget proposals via WhatsApp.',
      color: 'from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/20',
      badge: isPt ? 'Em breve' : 'Coming Soon'
    },
    {
      icon: FileSpreadsheet,
      title: isPt ? 'Relatórios & Métricas' : 'Reports & Analytics',
      desc: isPt
        ? 'Gráficos de receita mensal, ticket médio por categoria e balanço consolidado.'
        : 'Monthly revenue charts, average ticket per category, and consolidated reports.',
      color: 'from-purple-500/20 to-purple-500/5 text-purple-500 border-purple-500/20',
      badge: isPt ? 'Em breve' : 'Coming Soon'
    }
  ];

  return (
    <div className="w-full flex-1 flex flex-col pb-8">
      {/* Hero Banner Em Construção */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-[#222] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-[#111] dark:via-[#0e0e0e] dark:to-[#080808] p-6 sm:p-10 shadow-sm mb-6"
      >
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
              <DollarSign size={32} strokeWidth={2.5} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {isPt ? 'Módulo Financeiro' : 'Financial Module'}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Clock size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                  {isPt ? 'Em Construção' : 'Under Construction'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
                {isPt
                  ? 'Este painel está pronto para receber suas regras de negócio e funcionalidades personalizadas. Em breve você terá o controle completo das finanças da sua produtora aqui.'
                  : 'This dashboard is ready to receive your custom business logic. Soon you will have complete financial control of your production studio here.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <div className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 shadow-xs">
              <Sparkles size={14} className="text-emerald-500" />
              <span>{isPt ? 'Sob Medida' : 'Custom Tailored'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid de Funcionalidades em Planejamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upcomingFeatures.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * (idx + 1) }}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl p-5 hover:border-gray-300 dark:hover:border-[#333] transition-all flex flex-col justify-between shadow-xs group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 border border-gray-200/80 dark:border-[#2a2a2a]">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1a1a1a] flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  {isPt ? 'Módulo nativo planejado' : 'Planned native module'}
                </span>
                <ArrowUpRight size={13} className="text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Caixa de Aviso / Próximos Passos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 sm:p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/30 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <DollarSign size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {isPt ? 'Aguardando seus detalhes' : 'Awaiting your detailed specs'}
            </h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              {isPt
                ? 'Assim que você me passar o que precisa, montaremos aqui os campos, tabelas e gráficos exatamente como desejar.'
                : 'As soon as you share what you need, we will build the exact fields, tables, and charts here.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

