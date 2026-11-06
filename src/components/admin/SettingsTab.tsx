import React, { useState, useEffect } from 'react';
import { Database, Cloud, RefreshCw, Check, Copy, Globe, Shield, Moon, Sun, Layers, Folder, Download } from 'lucide-react';
import { syncAllToFirestore, getProjects, getClients, getNotes, getFiles, getConversations, getEmails, getCalendarEvents, getKnowledgeArticles, getContactMessages } from '../../utils/storage';

interface SettingsTabProps {
  lang: 'pt' | 'en';
  setLang: (lang: 'pt' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ lang, setLang, theme, setTheme }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);

  // Statistics for all collections
  const [counts, setCounts] = useState({
    imobiliario: 0,
    publicidade: 0,
    institucional: 0,
    clientes: 0,
    notas: 0,
    arquivos: 0,
    conversas: 0,
    emails: 0,
    calendario: 0,
    conhecimento: 0,
    mensagens: 0
  });

  const loadCounts = () => {
    const projects = getProjects();
    setCounts({
      imobiliario: projects.filter(p => p.category === 'Imobiliário').length,
      publicidade: projects.filter(p => p.category === 'Publicitário' || p.category === 'Publicidade').length,
      institucional: projects.filter(p => p.category === 'Institucional').length,
      clientes: getClients().length,
      notas: getNotes().length,
      arquivos: getFiles().length,
      conversas: getConversations().length,
      emails: getEmails().length,
      calendario: getCalendarEvents().length,
      conhecimento: getKnowledgeArticles().length,
      mensagens: getContactMessages().length
    });
  };

  useEffect(() => {
    loadCounts();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncAllToFirestore();
      loadCounts();
      setSyncFeedback(res.message);
    } catch (err: any) {
      setSyncFeedback(err.message || 'Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      projects: getProjects(),
      clients: getClients(),
      notes: getNotes(),
      files: getFiles(),
      conversations: getConversations(),
      emails: getEmails(),
      calendar: getCalendarEvents(),
      knowledge: getKnowledgeArticles(),
      messages: getContactMessages()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `animasystem_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const firestoreRulesSnippet = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  return (
    <div className="flex-1 flex flex-col space-y-8 pb-16">
      {/* Header Info */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white">
                {lang === 'pt' ? 'Arquitetura do Banco de Dados & Configurações' : 'Database Architecture & Settings'}
              </h2>
              <p className="text-xs text-gray-500">
                Cloud Firestore sincronizado com coleções segmentadas e nomes baseados nos títulos dos projetos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 dark:border-[#262626] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <Download size={14} /> {lang === 'pt' ? 'Exportar Backup JSON' : 'Export Backup'}
            </button>

            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Sincronizando Banco...' : 'Sincronizar Tudo no Firestore'}
            </button>
          </div>
        </div>

        {syncFeedback && (
          <div className="mt-4 p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Check size={14} />
            {syncFeedback}
          </div>
        )}
      </div>

      {/* Firestore Collections Segmentation Cards */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers size={14} />
          Mapeamento de Coleções no Cloud Firestore
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Projetos Imobiliário */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-500">projetos_imobiliario</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                {counts.imobiliario} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mb-2">
              ID do Documento: <code className="bg-gray-100 dark:bg-[#202020] px-1.5 py-0.5 rounded text-black dark:text-white font-mono text-[10px]">CASA_ALPHAVILLE</code>
            </p>
            <span className="text-[10px] text-gray-400">Espelhado em: <code className="font-mono">projetos/imobiliario/itens/...</code></span>
          </div>

          {/* Projetos Publicidade */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-500">projetos_publicidade</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                {counts.publicidade} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mb-2">
              ID do Documento: <code className="bg-gray-100 dark:bg-[#202020] px-1.5 py-0.5 rounded text-black dark:text-white font-mono text-[10px]">COMERCIAL_VOLVO</code>
            </p>
            <span className="text-[10px] text-gray-400">Espelhado em: <code className="font-mono">projetos/publicidade/itens/...</code></span>
          </div>

          {/* Projetos Institucional */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-500">projetos_institucional</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                {counts.institucional} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mb-2">
              ID do Documento: <code className="bg-gray-100 dark:bg-[#202020] px-1.5 py-0.5 rounded text-black dark:text-white font-mono text-[10px]">HOSPITAL_EINSTEIN</code>
            </p>
            <span className="text-[10px] text-gray-400">Espelhado em: <code className="font-mono">projetos/institucional/itens/...</code></span>
          </div>

          {/* Clientes */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-500">clientes</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                {counts.clientes} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Clientes reais vinculados aos projetos de portfólio.</p>
          </div>

          {/* Notas */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-pink-500">notas</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400">
                {counts.notas} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Roteiros, ideias de gravação e checklists técnicos.</p>
          </div>

          {/* Arquivos */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-500">arquivos</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
                {counts.arquivos} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Links para masters 4K, fotos RAW e arquivos de entrega.</p>
          </div>

          {/* Conversas */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-500">conversas</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                {counts.conversas} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Histórico de mensagens e alinhamento com clientes.</p>
          </div>

          {/* Calendário */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-500">calendario</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                {counts.calendario} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Diárias de gravação de drone, câmeras e prazos de entrega.</p>
          </div>

          {/* Base de Conhecimento */}
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-violet-500">base_conhecimento</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                {counts.conhecimento} docs
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Wiki de produção, guias de SARPAS e perfis de cor.</p>
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-bold text-black dark:text-white mb-4">
          Preferências do Sistema
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#181818] rounded-2xl">
            <div>
              <p className="text-xs font-bold text-black dark:text-white mb-0.5">Tema de Interface</p>
              <p className="text-[11px] text-gray-500">Alterne entre modo escuro cinematográfico e modo claro</p>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] text-xs font-bold text-black dark:text-white flex items-center gap-2 cursor-pointer"
            >
              {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              {theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#181818] rounded-2xl">
            <div>
              <p className="text-xs font-bold text-black dark:text-white mb-0.5">Idioma do Painel</p>
              <p className="text-[11px] text-gray-500">Português (Brasil) ou English</p>
            </div>
            <button
              onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] text-xs font-bold text-black dark:text-white flex items-center gap-2 cursor-pointer"
            >
              <Globe size={14} />
              {lang === 'pt' ? 'Português' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Firestore Security Rules helper */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-emerald-500" />
            <h3 className="text-sm font-bold text-black dark:text-white">
              Regras do Cloud Firestore
            </h3>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(firestoreRulesSnippet);
              setCopiedRules(true);
              setTimeout(() => setCopiedRules(false), 3000);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#202020] hover:bg-gray-200 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            <Copy size={13} />
            {copiedRules ? 'Copiado!' : 'Copiar Regras'}
          </button>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
          Para garantir permissão irrestrita de gravação no console do Firebase (<a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">console.firebase.google.com</a>), publique estas regras na aba <strong>Regras</strong>:
        </p>

        <pre className="p-4 bg-gray-50 dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#222] rounded-xl text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto select-all">
          {firestoreRulesSnippet}
        </pre>
      </div>
    </div>
  );
};
