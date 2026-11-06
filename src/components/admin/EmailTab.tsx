import React, { useState, useEffect } from 'react';
import { Mail, Send, Plus, Search, Check, Sparkles, Clock, FileText } from 'lucide-react';
import { EmailItem } from '../../types';
import { getEmails, sendEmail } from '../../utils/storage';

interface EmailTabProps {
  lang: 'pt' | 'en';
}

export const EmailTab: React.FC<EmailTabProps> = ({ lang }) => {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [search, setSearch] = useState('');

  // Form states
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateType, setTemplateType] = useState<EmailItem['templateType']>('personalizado');

  const templates = {
    avaliacao: {
      subject: "Solicitação de Avaliação do Projeto - Daniel Vale",
      body: "Olá equipe,\n\nFoi uma satisfação enorme realizar a produção deste filme. Gostaríamos de convidar vocês a deixar uma avaliação rápida (com estrelas e áudio/comentário) em nossa plataforma de portfólio.\n\nLink direto de avaliação: https://danielvale.com/#avaliacao\n\nMuito obrigado pela confiança!\n\nAtenciosamente,\nDaniel Vale | Direção e Cinematografia"
    },
    aprovacao: {
      subject: "Prévia para Aprovação de Corte - Versão 1.0",
      body: "Olá!\n\nFinalizamos o primeiro corte do vídeo com color grading e sound design preliminar.\n\nPor favor, assistam e nos retornem com seus comentários de minutagem para finalização.\n\nAtenciosamente,\nDaniel Vale"
    },
    download: {
      subject: "Entrega do Vídeo Master 4K e Cortes Sociais",
      body: "Prezado cliente,\n\nO vídeo master em resolução 4K Ultra HD (ProRes 422HQ e H.264 Web) está pronto para download em nosso servidor de alta velocidade.\n\nSeu código de acesso único: 4K-DANIEL-2026\n\nQualquer dúvida técnica com a veiculação, estamos à disposição!\n\nAbraços,\nDaniel Vale"
    },
    briefing: {
      subject: "Agendamento da Diária de Filmagem & Checklist",
      body: "Olá!\n\nConfirmamos a gravação para a próxima semana. Recomenda-se que o local esteja completamente limpo e preparado até as 07h para aproveitarmos a iluminação matinal.\n\nEquipamentos mobilizados: Câmera Cinema Sony FX3 + Lentes G Master + Drone DJI Mavic 3 Pro.\n\nAtenciosamente,\nDaniel Vale"
    }
  };

  const applyTemplate = (type: 'avaliacao' | 'aprovacao' | 'download' | 'briefing') => {
    setTemplateType(type);
    setSubject(templates[type].subject);
    setBody(templates[type].body);
  };

  const reload = () => {
    const list = getEmails();
    setEmails(list);
    if (!selectedEmail && list.length > 0) {
      setSelectedEmail(list[0]);
    }
  };

  useEffect(() => {
    reload();
    window.addEventListener('emails-updated', reload);
    return () => window.removeEventListener('emails-updated', reload);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim() || !subject.trim()) return;

    sendEmail({
      to,
      subject,
      body,
      templateType,
      status: 'enviado'
    });

    setTo('');
    setSubject('');
    setBody('');
    setIsComposing(false);
    reload();
  };

  const filteredEmails = emails.filter(e =>
    e.to.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-230px)] min-h-[500px] bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl overflow-hidden shadow-sm">
      <div className="flex h-full">
        {/* Left List */}
        <div className="w-80 sm:w-96 border-r border-gray-200 dark:border-[#1c1c1c] flex flex-col h-full bg-gray-50/50 dark:bg-[#0e0e0e]">
          <div className="p-4 border-b border-gray-200 dark:border-[#1c1c1c] flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={lang === 'pt' ? 'Buscar e-mails...' : 'Search emails...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-full text-xs pl-9 pr-3 py-1.5 text-black dark:text-white focus:outline-none"
              />
            </div>
            <button
              onClick={() => setIsComposing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer flex-shrink-0"
            >
              <Plus size={13} />
              {lang === 'pt' ? 'Novo' : 'New'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#181818]">
            {filteredEmails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full text-left p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-blue-600'
                      : 'hover:bg-gray-100/70 dark:hover:bg-[#141414]'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Mail size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-black dark:text-white truncate">
                        Para: {email.to}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {email.date}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate mb-0.5">
                      {email.subject}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {email.body.replace(/\n/g, ' ')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right View Area */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111]">
          {selectedEmail ? (
            <div className="flex-1 flex flex-col h-full p-8 overflow-y-auto">
              <div className="border-b border-gray-100 dark:border-[#1c1c1c] pb-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full">
                    <Check size={12} /> Enviado com sucesso
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {selectedEmail.date}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-black dark:text-white mb-2">
                  {selectedEmail.subject}
                </h2>
                <p className="text-xs text-gray-500">
                  <strong className="text-gray-700 dark:text-gray-300">Destinatário:</strong> {selectedEmail.to}
                </p>
              </div>

              <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedEmail.body}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-xs">
              Selecione uma mensagem para visualizar
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              {lang === 'pt' ? 'Escrever Novo E-mail' : 'Compose Email'}
            </h3>

            {/* Quick Templates */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" />
                Modelos Rápidos de Cinema
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('avaliacao')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#202020] text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-500 transition-colors"
                >
                  Pedir Avaliação
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('aprovacao')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#202020] text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-500 transition-colors"
                >
                  Aprovação de Corte
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('download')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#202020] text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-500 transition-colors"
                >
                  Entrega Master 4K
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('briefing')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#202020] text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-500 transition-colors"
                >
                  Agendamento Diária
                </button>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Para (E-mail) *
                </label>
                <input
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="cliente@alphaville.com.br"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Assunto *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Assunto da mensagem"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escreva a mensagem..."
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-[#262626] text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  <Send size={13} />
                  Enviar E-mail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
