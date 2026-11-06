import React, { useState, useEffect } from 'react';
import { Headphones, Send, Plus, CheckCircle2, AlertCircle, Clock, ExternalLink, ShieldCheck, Activity } from 'lucide-react';
import { SupportTicket } from '../../types';
import { getSupportTickets, addSupportTicket } from '../../utils/storage';

interface SupportTabProps {
  lang: 'pt' | 'en';
}

export const SupportTab: React.FC<SupportTabProps> = ({ lang }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isOpeningTicket, setIsOpeningTicket] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SupportTicket['priority']>('media');

  const reload = () => {
    setTickets(getSupportTickets());
  };

  useEffect(() => {
    reload();
    window.addEventListener('support-updated', reload);
    return () => window.removeEventListener('support-updated', reload);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    addSupportTicket({
      subject: subject.trim(),
      description: description.trim(),
      priority,
      status: 'aberto'
    });

    setSubject('');
    setDescription('');
    setPriority('media');
    setIsOpeningTicket(false);
    reload();
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Headphones size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white">
                {lang === 'pt' ? 'Suporte Técnico Especializado' : 'Support Desk'}
              </h2>
              <p className="text-xs text-gray-500">
                Abertura de chamados, status dos serviços em nuvem e atendimento direto.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20t%C3%A9cnico%20com%20o%20AnimaSystem%20Portf%C3%B3lio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <ExternalLink size={13} /> Atendimento WhatsApp
            </a>

            <button
              onClick={() => setIsOpeningTicket(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={14} /> Abrir Chamado
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics / Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Cloud Firestore</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Operacional & Online</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Armazenamento Local</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Sincronizado e Íntegro</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center flex-shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tempo de Resposta</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Média &lt; 2 Horas</span>
          </div>
        </div>
      </div>

      {/* Ticket Open Modal */}
      {isOpeningTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              Abrir Novo Chamado de Suporte
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Assunto *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Dúvida sobre sincronização de vídeo 4K"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="baixa">Baixa (Dúvidas gerais)</option>
                  <option value="media">Média (Ajustes no portfólio)</option>
                  <option value="alta">Alta (Problemas no upload ou banco)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Descrição detalhada *
                </label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o que ocorreu ou o que precisa de auxílio..."
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpeningTicket(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-[#262626] text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  Enviar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Histórico de Chamados</h3>
        {tickets.length === 0 ? (
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-8 text-center text-xs text-gray-500">
            Nenhum chamado aberto. Tudo funcionando normalmente!
          </div>
        ) : (
          tickets.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-sm text-black dark:text-white">
                    {t.subject}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.priority === 'alta'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                      : t.priority === 'media'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-[#202020] text-gray-600 dark:text-gray-400'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs flex-shrink-0">
                <span className="text-[11px] text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={12} /> {t.status === 'aberto' ? 'Em Análise' : 'Resolvido'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
