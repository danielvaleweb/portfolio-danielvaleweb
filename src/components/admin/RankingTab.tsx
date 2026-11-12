import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  Folder, 
  DollarSign, 
  MessageSquare, 
  Search, 
  Sparkles, 
  Phone, 
  ExternalLink,
  Users,
  Award,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { Client, Project, Evaluation, FinancialTransaction } from '../../types';
import { 
  getClients, 
  getProjects, 
  getEvaluations, 
  getFinancialTransactions 
} from '../../utils/storage';

interface RankingTabProps {
  lang: 'pt' | 'en';
  onNavigateToClient?: (clientId: string) => void;
  onNavigateToProjects?: (filterClientName?: string) => void;
}

export interface ClientRankData {
  client: Client;
  projectCount: number;
  totalInvested: number;
  evaluationCount: number;
  avgStars: number;
  projects: Project[];
  evaluations: Evaluation[];
}

export const RankingTab: React.FC<RankingTabProps> = ({ 
  lang, 
  onNavigateToClient,
  onNavigateToProjects 
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'projects' | 'investment' | 'evaluations'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setClients(getClients());
    setProjects(getProjects());
    setEvaluations(getEvaluations());
    setTransactions(getFinancialTransactions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('clients-updated', loadData);
    window.addEventListener('projects-updated', loadData);
    window.addEventListener('financial-transactions-updated', loadData);
    return () => {
      window.removeEventListener('clients-updated', loadData);
      window.removeEventListener('projects-updated', loadData);
      window.removeEventListener('financial-transactions-updated', loadData);
    };
  }, []);

  // Calcula os dados consolidados de cada cliente
  const rankData: ClientRankData[] = useMemo(() => {
    return clients.map(client => {
      // 1. Projetos vinculados ao cliente
      const clientProjects = projects.filter(p => p.clientId === client.id);
      const projectCount = clientProjects.length;

      // 2. Total investido (soma de transações financeiras + preços de projetos)
      const countedProjectIds = new Set<string>();
      let totalInvested = 0;

      transactions
        .filter(tx => tx.type === 'income' && (
          tx.clientId === client.id || 
          (tx.clientName && tx.clientName.trim().toLowerCase() === client.name.trim().toLowerCase())
        ))
        .forEach(tx => {
          totalInvested += Number(tx.amount) || 0;
          if (tx.projectId) {
            countedProjectIds.add(tx.projectId);
          }
        });

      clientProjects
        .filter(p => !countedProjectIds.has(p.id))
        .forEach(p => {
          if (typeof p.price === 'number' && p.price > 0) {
            totalInvested += p.price;
          }
        });

      // 3. Avaliações ligadas ao cliente ou aos seus projetos
      const clientProjectIds = new Set(clientProjects.map(p => p.id));
      const clientProjectTitles = new Set(clientProjects.map(p => p.title.trim().toLowerCase()));

      const clientEvals = evaluations.filter(ev => {
        if (ev.projectId && clientProjectIds.has(ev.projectId)) return true;
        if (ev.projectName && clientProjectTitles.has(ev.projectName.trim().toLowerCase())) return true;
        if (ev.clientName && ev.clientName.trim().toLowerCase() === client.name.trim().toLowerCase()) return true;
        return false;
      });

      const evaluationCount = clientEvals.length;
      const avgStars = evaluationCount > 0 
        ? clientEvals.reduce((acc, e) => acc + (Number(e.stars) || 5), 0) / evaluationCount 
        : 0;

      return {
        client,
        projectCount,
        totalInvested,
        evaluationCount,
        avgStars,
        projects: clientProjects,
        evaluations: clientEvals,
      };
    });
  }, [clients, projects, evaluations, transactions]);

  // Top 3 que mais têm projetos
  const topProjects = useMemo(() => {
    return [...rankData]
      .sort((a, b) => b.projectCount - a.projectCount || b.totalInvested - a.totalInvested)
      .slice(0, 3);
  }, [rankData]);

  // Top 3 que mais investiram
  const topInvestment = useMemo(() => {
    return [...rankData]
      .sort((a, b) => b.totalInvested - a.totalInvested || b.projectCount - a.projectCount)
      .slice(0, 3);
  }, [rankData]);

  // Top 3 que mais avaliaram
  const topEvaluations = useMemo(() => {
    return [...rankData]
      .sort((a, b) => b.evaluationCount - a.evaluationCount || b.avgStars - a.avgStars || b.projectCount - a.projectCount)
      .slice(0, 3);
  }, [rankData]);

  // Lista ordenada conforme aba selecionada e filtro de busca
  const sortedAndFilteredList = useMemo(() => {
    let list = [...rankData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.client.name.toLowerCase().includes(q) ||
        (item.client.company && item.client.company.toLowerCase().includes(q)) ||
        (item.client.role && item.client.role.toLowerCase().includes(q))
      );
    }

    switch (activeCategory) {
      case 'projects':
        list.sort((a, b) => b.projectCount - a.projectCount || b.totalInvested - a.totalInvested);
        break;
      case 'investment':
        list.sort((a, b) => b.totalInvested - a.totalInvested || b.projectCount - a.projectCount);
        break;
      case 'evaluations':
        list.sort((a, b) => b.evaluationCount - a.evaluationCount || b.avgStars - a.avgStars || b.totalInvested - a.totalInvested);
        break;
      case 'all':
      default:
        // Score de fidelidade geral: valor investido + peso por projeto e avaliações
        list.sort((a, b) => {
          const scoreA = a.totalInvested + (a.projectCount * 500) + (a.evaluationCount * 250);
          const scoreB = b.totalInvested + (b.projectCount * 500) + (b.evaluationCount * 250);
          return scoreB - scoreA;
        });
        break;
    }

    return list;
  }, [rankData, activeCategory, searchQuery]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getPositionBadge = (pos: number) => {
    switch (pos) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-black flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-200">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500 text-black flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(148,163,184,0.4)] border border-slate-200">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-700 via-amber-800 to-yellow-950 text-white flex items-center justify-center font-black text-sm shadow-[0_0_10px_rgba(180,83,9,0.3)] border border-amber-600/40">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#222] text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold text-xs border border-gray-200 dark:border-[#333]">
            #{pos}
          </div>
        );
    }
  };

  const totalClientsCount = clients.length;
  const totalProjectsProduced = projects.length;
  const totalRevenue = rankData.reduce((acc, c) => acc + c.totalInvested, 0);
  const totalReviews = evaluations.length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar space-y-6 pb-12">
      {/* 1. Header com Totais / KPIs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-gray-50 to-white dark:from-[#111111] dark:to-[#161616] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-[#222] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Trophy size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Ranking de Clientes
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Top Fidelidade
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Reconhecimento, volume de projetos e valor gerado pelos seus principais clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] text-center">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block">Clientes</span>
            <span className="text-base sm:text-lg font-black text-gray-900 dark:text-white">{totalClientsCount}</span>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] text-center">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block">Projetos</span>
            <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">{totalProjectsProduced}</span>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] text-center">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block">Faturamento</span>
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-gray-200 dark:border-[#2a2a2a] text-center">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block">Avaliações</span>
            <span className="text-base sm:text-lg font-black text-amber-500">{totalReviews}</span>
          </div>
        </div>
      </div>

      {/* 2. OS 3 PÓDIOS PRINCIPAIS: TOP 1, 2 e 3 (Projetos, Investimento, Avaliações) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* PÓDIO 1: MAIS PROJETOS */}
        <div className="bg-gradient-to-b from-blue-500/5 via-transparent to-transparent dark:from-blue-500/10 rounded-2xl border border-blue-500/20 p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold">
                  <Folder size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Mais Projetos</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Top 3 em volume de produções</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                PRODUÇÃO
              </span>
            </div>

            <div className="space-y-2.5">
              {topProjects.map((item, idx) => (
                <div 
                  key={item.client.id}
                  onClick={() => onNavigateToClient?.(item.client.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    idx === 0 
                      ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50' 
                      : idx === 1
                      ? 'bg-slate-500/5 border-slate-400/20 hover:border-slate-400/40'
                      : 'bg-amber-900/5 border-amber-700/20 hover:border-amber-700/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden">
                      {item.client.avatarUrl || item.client.logoUrl ? (
                        <img src={item.client.avatarUrl || item.client.logoUrl} alt={item.client.name} className="w-full h-full object-cover" />
                      ) : (
                        item.client.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {item.client.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {item.client.company || item.client.role || 'Cliente'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 block">
                      {item.projectCount} {item.projectCount === 1 ? 'projeto' : 'projetos'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatCurrency(item.totalInvested)}
                    </span>
                  </div>
                </div>
              ))}

              {topProjects.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-6">Nenhum cliente cadastrado.</p>
              )}
            </div>
          </div>
        </div>

        {/* PÓDIO 2: MAIOR INVESTIMENTO */}
        <div className="bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent dark:from-emerald-500/10 rounded-2xl border border-emerald-500/20 p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                  <DollarSign size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Maior Investimento</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Top 3 em receita gerada</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                FATURAMENTO
              </span>
            </div>

            <div className="space-y-2.5">
              {topInvestment.map((item, idx) => (
                <div 
                  key={item.client.id}
                  onClick={() => onNavigateToClient?.(item.client.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    idx === 0 
                      ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50' 
                      : idx === 1
                      ? 'bg-slate-500/5 border-slate-400/20 hover:border-slate-400/40'
                      : 'bg-amber-900/5 border-amber-700/20 hover:border-amber-700/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden">
                      {item.client.avatarUrl || item.client.logoUrl ? (
                        <img src={item.client.avatarUrl || item.client.logoUrl} alt={item.client.name} className="w-full h-full object-cover" />
                      ) : (
                        item.client.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {item.client.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {item.client.company || item.client.role || 'Cliente'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                      {formatCurrency(item.totalInvested)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {item.projectCount} {item.projectCount === 1 ? 'projeto' : 'projetos'}
                    </span>
                  </div>
                </div>
              ))}

              {topInvestment.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-6">Nenhum investimento registrado.</p>
              )}
            </div>
          </div>
        </div>

        {/* PÓDIO 3: MAIS AVALIAÇÕES */}
        <div className="bg-gradient-to-b from-amber-500/5 via-transparent to-transparent dark:from-amber-500/10 rounded-2xl border border-amber-500/20 p-4 sm:p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                  <Star size={17} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Mais Avaliações</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Top 3 em feedbacks enviados</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                ENGAJAMENTO
              </span>
            </div>

            <div className="space-y-2.5">
              {topEvaluations.map((item, idx) => (
                <div 
                  key={item.client.id}
                  onClick={() => onNavigateToClient?.(item.client.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    idx === 0 
                      ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50' 
                      : idx === 1
                      ? 'bg-slate-500/5 border-slate-400/20 hover:border-slate-400/40'
                      : 'bg-amber-900/5 border-amber-700/20 hover:border-amber-700/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden">
                      {item.client.avatarUrl || item.client.logoUrl ? (
                        <img src={item.client.avatarUrl || item.client.logoUrl} alt={item.client.name} className="w-full h-full object-cover" />
                      ) : (
                        item.client.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                        {item.client.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {item.client.company || item.client.role || 'Cliente'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-black text-amber-500 block flex items-center justify-end gap-1">
                      {item.evaluationCount} {item.evaluationCount === 1 ? 'avaliação' : 'avaliações'}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                      {item.avgStars > 0 ? (
                        <>★ {item.avgStars.toFixed(1)} / 5.0</>
                      ) : (
                        'Sem nota'
                      )}
                    </span>
                  </div>
                </div>
              ))}

              {topEvaluations.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-6">Nenhuma avaliação registrada.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. LISTA GERAL DE TODOS OS CLIENTES (TABELA RANKING COMPLETA) */}
      <div className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-[#222] p-4 sm:p-6 shadow-sm space-y-4">
        {/* Barra de Filtros e Busca */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-[#222]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222]'
              }`}
            >
              Geral (Fidelidade)
            </button>
            <button
              onClick={() => setActiveCategory('projects')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'projects'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222]'
              }`}
            >
              <Folder size={13} />
              Mais Projetos
            </button>
            <button
              onClick={() => setActiveCategory('investment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'investment'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222]'
              }`}
            >
              <DollarSign size={13} />
              Maior Investimento
            </button>
            <button
              onClick={() => setActiveCategory('evaluations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeCategory === 'evaluations'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#222]'
              }`}
            >
              <Star size={13} />
              Mais Avaliações
            </button>
          </div>

          {/* Busca por cliente */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar cliente ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
            />
          </div>
        </div>

        {/* Tabela de Ranking */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-[#222]">
                <th className="py-3 px-3 font-semibold w-16 text-center">POS</th>
                <th className="py-3 px-3 font-semibold">CLIENTE</th>
                <th className="py-3 px-3 font-semibold text-center">PROJETOS</th>
                <th className="py-3 px-3 font-semibold text-right">INVESTIMENTO</th>
                <th className="py-3 px-3 font-semibold text-center">AVALIAÇÕES</th>
                <th className="py-3 px-3 font-semibold text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1d1d1d]">
              {sortedAndFilteredList.map((item, index) => {
                const pos = index + 1;
                return (
                  <tr 
                    key={item.client.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-[#181818] transition-colors group"
                  >
                    {/* Posição */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center">
                        {getPositionBadge(pos)}
                      </div>
                    </td>

                    {/* Cliente (Avatar + Nome + Empresa + Telefone) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-[#333] flex items-center justify-center font-bold text-xs flex-shrink-0 overflow-hidden text-gray-700 dark:text-gray-300">
                          {item.client.avatarUrl || item.client.logoUrl ? (
                            <img src={item.client.avatarUrl || item.client.logoUrl} alt={item.client.name} className="w-full h-full object-cover" />
                          ) : (
                            item.client.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => onNavigateToClient?.(item.client.id)}
                            className="font-bold text-gray-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 text-left transition-colors truncate block"
                          >
                            {item.client.name}
                          </button>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate block">
                            {item.client.company ? `${item.client.company}${item.client.role ? ` • ${item.client.role}` : ''}` : (item.client.role || 'Cliente')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Projetos */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-xs ${
                        item.projectCount > 0 
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40' 
                          : 'text-gray-400'
                      }`}>
                        <Folder size={12} />
                        {item.projectCount}
                      </span>
                    </td>

                    {/* Total Investido */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {formatCurrency(item.totalInvested)}
                      </span>
                      {item.projectCount > 0 && item.totalInvested > 0 && (
                        <span className="text-[10px] text-gray-400">
                          média {formatCurrency(item.totalInvested / item.projectCount)}/proj
                        </span>
                      )}
                    </td>

                    {/* Avaliações */}
                    <td className="py-3 px-3 text-center">
                      {item.evaluationCount > 0 ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/40 text-[11px]">
                            <Star size={11} className="fill-amber-400" />
                            {item.avgStars.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {item.evaluationCount} {item.evaluationCount === 1 ? 'opinião' : 'opiniões'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px] italic">Sem avaliação</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.client.phone && (
                          <a
                            href={`https://wa.me/${item.client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá ${item.client.name}! Passando para agradecer pela parceria e confiança nos nossos trabalhos!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Conversar no WhatsApp"
                          >
                            <Phone size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => onNavigateToClient?.(item.client.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1"
                        >
                          Ver Perfil
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sortedAndFilteredList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                    Nenhum cliente encontrado com os critérios de busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

