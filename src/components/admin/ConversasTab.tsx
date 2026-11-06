import React, { useState, useEffect } from 'react';
import { Send, Plus, Search, MessageCircle, User, Folder, CheckCheck } from 'lucide-react';
import { Conversation } from '../../types';
import { getConversations, addMessageToConversation, createConversation } from '../../utils/storage';

interface ConversasTabProps {
  lang: 'pt' | 'en';
}

export const ConversasTab: React.FC<ConversasTabProps> = ({ lang }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');
  const [isNewConvOpen, setIsNewConvOpen] = useState(false);

  // New conversation form
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [initialMsg, setInitialMsg] = useState('');

  const reload = () => {
    const list = getConversations();
    setConversations(list);
    if (!selectedConvId && list.length > 0) {
      setSelectedConvId(list[0].id);
    }
  };

  useEffect(() => {
    reload();
    window.addEventListener('conversations-updated', reload);
    return () => window.removeEventListener('conversations-updated', reload);
  }, []);

  const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConv) return;
    addMessageToConversation(selectedConv.id, messageText.trim(), true);
    setMessageText('');
    reload();
  };

  const handleCreateConv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    const conv = createConversation(clientName.trim(), projectName.trim() || undefined, initialMsg.trim() || undefined);
    setSelectedConvId(conv.id);
    setClientName('');
    setProjectName('');
    setInitialMsg('');
    setIsNewConvOpen(false);
    reload();
  };

  const filteredConvs = conversations.filter(c => 
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    (c.projectName && c.projectName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-230px)] min-h-[500px] bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl overflow-hidden shadow-sm">
      <div className="flex h-full">
        {/* Left Sidebar: Conversation List */}
        <div className="w-80 sm:w-96 border-r border-gray-200 dark:border-[#1c1c1c] flex flex-col h-full bg-gray-50/50 dark:bg-[#0e0e0e]">
          <div className="p-4 border-b border-gray-200 dark:border-[#1c1c1c] flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={lang === 'pt' ? 'Buscar conversa...' : 'Search chat...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-full text-xs pl-9 pr-3 py-1.5 text-black dark:text-white focus:outline-none"
              />
            </div>
            <button
              onClick={() => setIsNewConvOpen(true)}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex-shrink-0"
              title="Nova conversa"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-[#181818]">
            {filteredConvs.map((conv) => {
              const isActive = conv.id === selectedConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left p-4 transition-colors flex items-start gap-3 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-blue-600' 
                      : 'hover:bg-gray-100/70 dark:hover:bg-[#141414]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#222] flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                    {conv.clientName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-black dark:text-white truncate">
                        {conv.clientName}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(conv.updatedAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    {conv.projectName && (
                      <p className="text-[10px] text-blue-500 font-semibold truncate mb-1">
                        {conv.projectName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Chat Area */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111]">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 dark:border-[#1c1c1c] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
                  {selectedConv.clientName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black dark:text-white">
                    {selectedConv.clientName}
                  </h3>
                  {selectedConv.projectName && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Folder size={11} /> {selectedConv.projectName}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                {lang === 'pt' ? 'Canal Ativo' : 'Active Channel'}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/30 dark:bg-[#0c0c0c]/30">
              {selectedConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-semibold text-gray-400 mb-1 px-1">
                    {msg.sender} • {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.isMe
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-gray-100 dark:bg-[#202020] text-black dark:text-white rounded-tl-none border border-gray-200 dark:border-[#282828]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-[#1c1c1c] flex items-center gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={lang === 'pt' ? 'Digite uma mensagem para o cliente...' : 'Type a message...'}
                className="flex-1 bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-full px-5 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-sm"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-xs">
            {lang === 'pt' ? 'Selecione uma conversa ao lado.' : 'Select a conversation.'}
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {isNewConvOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              {lang === 'pt' ? 'Iniciar Nova Conversa' : 'Start New Chat'}
            </h3>
            <form onSubmit={handleCreateConv} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  {lang === 'pt' ? 'Nome do Cliente / Empresa' : 'Client Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Construtora Alphaville"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  {lang === 'pt' ? 'Projeto Relacionado' : 'Related Project'}
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Casa Alphaville"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  {lang === 'pt' ? 'Primeira Mensagem' : 'First Message'}
                </label>
                <textarea
                  rows={3}
                  value={initialMsg}
                  onChange={(e) => setInitialMsg(e.target.value)}
                  placeholder="Olá! Segue o link com a primeira versão do corte para análise."
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewConvOpen(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-[#262626] text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  Criar Conversa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
