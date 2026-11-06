import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Trash2, CheckCircle2, Archive, Search, ExternalLink } from 'lucide-react';
import { ContactMessage } from '../../types';
import { getContactMessages, updateContactMessageStatus, deleteContactMessage } from '../../utils/storage';

interface MessagesTabProps {
  lang: 'pt' | 'en';
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ lang }) => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [search, setSearch] = useState('');

  const reload = () => {
    setMessages(getContactMessages());
  };

  useEffect(() => {
    reload();
    window.addEventListener('messages-updated', reload);
    return () => window.removeEventListener('messages-updated', reload);
  }, []);

  const handleStatus = (id: string, status: ContactMessage['status']) => {
    updateContactMessageStatus(id, status);
    reload();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta mensagem permanentemente?')) {
      deleteContactMessage(id);
      reload();
    }
  };

  const filtered = messages.filter(m => {
    const matchesStatus = filterStatus === 'todos' || m.status === filterStatus;
    const matchesSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12">
      {/* Filter and search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['todos', 'novo', 'respondido', 'arquivado'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {st === 'todos' ? 'Todas as Mensagens' : st === 'novo' ? 'Novas (Não Lidas)' : st === 'respondido' ? 'Respondidas' : 'Arquivadas'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={lang === 'pt' ? 'Pesquisar mensagem...' : 'Search message...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] rounded-full text-xs pl-9 pr-4 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 w-52 sm:w-64"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-12 text-center text-gray-500 text-xs">
            Nenhuma mensagem encontrada neste filtro.
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white dark:bg-[#111] border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                msg.status === 'novo'
                  ? 'border-blue-500/50 dark:border-blue-500/40 bg-blue-500/[0.02]'
                  : 'border-gray-200 dark:border-[#222]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-bold text-sm text-black dark:text-white">
                    {msg.name}
                  </span>

                  {msg.status === 'novo' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">
                      Nova
                    </span>
                  )}

                  {msg.status === 'respondido' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                      Respondida
                    </span>
                  )}

                  <span className="text-[11px] text-gray-400">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {msg.email}
                  </span>
                  {msg.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {msg.phone}
                    </span>
                  )}
                  {msg.projectInterest && (
                    <span className="text-blue-500 font-medium">
                      Interesse: {msg.projectInterest}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-[#1e1e1e]">
                {msg.phone && (
                  <a
                    href={`https://wa.me/${msg.phone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(msg.name)}%2C%20recebemos%20sua%20mensagem%20no%20portf%C3%B3lio%20de%20filmes.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleStatus(msg.id, 'respondido')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    <ExternalLink size={12} /> WhatsApp
                  </a>
                )}

                <a
                  href={`mailto:${msg.email}?subject=Contato%20Portf%C3%B3lio%20Daniel%20Vale`}
                  onClick={() => handleStatus(msg.id, 'respondido')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                >
                  <Mail size={12} /> Responder E-mail
                </a>

                {msg.status !== 'arquivado' ? (
                  <button
                    onClick={() => handleStatus(msg.id, 'arquivado')}
                    title="Arquivar"
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    <Archive size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatus(msg.id, 'novo')}
                    title="Mover para novas"
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(msg.id)}
                  title="Excluir"
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
