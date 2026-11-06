import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, Database } from 'lucide-react';

interface HelpCenterTabProps {
  lang: 'pt' | 'en';
  onNavigateToSupport?: () => void;
}

export const HelpCenterTab: React.FC<HelpCenterTabProps> = ({ lang, onNavigateToSupport }) => {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Como as coleções do banco de dados são organizadas?",
      a: "O sistema organiza os projetos automaticamente em coleções específicas conforme a categoria: 'projetos_imobiliario', 'projetos_publicidade' e 'projetos_institucional'. Além disso, cria uma estrutura hierárquica 'projetos/{categoria}/itens/{TITULO_DO_PROJETO}' onde o ID do documento é o nome do projeto formatado em letras maiúsculas e sem acentos (por exemplo: CASA_ALPHAVILLE)."
    },
    {
      q: "Como o cliente avalia um projeto e grava depoimentos?",
      a: "No modal de Review/Avaliação de cada projeto, o cliente pode conceder notas de 1 a 5 estrelas, digitar observações técnicas e até mesmo gravar áudio de feedback diretamente pelo navegador. Todos esses dados são sincronizados no banco de dados."
    },
    {
      q: "O que fazer se o Firebase apresentar erro de 'PERMISSION_DENIED'?",
      a: "Basta acessar o Firebase Console (console.firebase.google.com), abrir seu projeto, navegar até Cloud Firestore > aba Regras, e colar a regra irrestrita: 'match /{document=**} { allow read, write: if true; }'. Depois clique em Publicar e use o botão 'Sincronizar Banco' neste painel."
    },
    {
      q: "Como enviar arquivos masters 4K e controlar códigos de download?",
      a: "Na aba 'Arquivos' ou direto nas configurações do projeto, você cadastra o link na nuvem (Google Drive, Vimeo Pro ou Cloud Storage) e define um código de download único para o cliente acessar sem necessidade de login."
    },
    {
      q: "Como cadastrar novas diárias de filmagem no Calendário?",
      a: "Acesse a aba 'Calendário' no menu lateral e clique em 'Agendar Diária / Prazo'. Você pode vincular a data ao projeto correspondente, definir local, janela de horário e status da filmagem."
    }
  ];

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white">
                {lang === 'pt' ? 'Central de Ajuda & Documentação' : 'Help Center'}
              </h2>
              <p className="text-xs text-gray-500">
                Respostas rápidas sobre a organização do portfólio, coleções do banco e fluxos de trabalho.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar dúvidas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-full text-xs pl-9 pr-4 py-2 text-black dark:text-white focus:outline-none focus:border-blue-500 w-52 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filtered.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-[#171717]"
              >
                <span className="font-bold text-sm text-black dark:text-white">
                  {faq.q}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-[#1c1c1c]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Need More Help Box */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200 mb-1">
            Precisa de suporte técnico adicional?
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Abra um ticket ou chame diretamente no WhatsApp pelo nosso canal de suporte.
          </p>
        </div>
        {onNavigateToSupport && (
          <button
            onClick={onNavigateToSupport}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Ir para Suporte
          </button>
        )}
      </div>
    </div>
  );
};
