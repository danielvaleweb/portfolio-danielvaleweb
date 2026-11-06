import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, X, Plus, Trash2, Pin, Check, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Project, Note } from '../types';

interface ProjectNoteModalProps {
  isOpen: boolean;
  project: Project | null;
  notes: Note[];
  onClose: () => void;
  onSaveNote: (data: { title: string; content: string; category: string; isPinned: boolean }) => Promise<void> | void;
  onDeleteNote: (noteId: string) => void;
  onNavigateToAllNotes?: () => void;
  lang?: 'pt' | 'en';
}

export default function ProjectNoteModal({
  isOpen,
  project,
  notes,
  onClose,
  onSaveNote,
  onDeleteNote,
  onNavigateToAllNotes,
  lang = 'pt',
}: ProjectNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Geral');
  const [isPinned, setIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen || !project) return null;

  const categories = ['Geral', 'Roteiros', 'Ideias', 'Reuniões'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      await onSaveNote({
        title: title.trim(),
        content: content.trim(),
        category,
        isPinned,
      });

      setTitle('');
      setContent('');
      setCategory('Geral');
      setIsPinned(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-[#222] flex items-start justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {lang === 'pt' ? 'Notas do Projeto' : 'Project Notes'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#888] font-medium truncate max-w-xs sm:max-w-sm mt-0.5">
                  {project.title} • <span className="text-blue-500">{project.category || 'Geral'}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#222] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-500 dark:text-[#888] hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-6">
            {/* Feedback notification */}
            {successToast && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2"
              >
                <Check size={15} />
                <span>{lang === 'pt' ? 'Nota adicionada com sucesso ao projeto!' : 'Note added successfully!'}</span>
              </motion.div>
            )}

            {/* Existing Notes for this project */}
            {notes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">
                    {lang === 'pt' ? `Notas vinculadas (${notes.length})` : `Attached Notes (${notes.length})`}
                  </h4>
                  {onNavigateToAllNotes && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToAllNotes();
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {lang === 'pt' ? 'Ver no bloco de notas' : 'Open in Notes'}
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#262626] rounded-2xl p-4 flex flex-col gap-2 relative group hover:border-gray-300 dark:hover:border-[#333] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {note.isPinned && (
                            <span className="p-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                              <Pin size={11} className="fill-current" />
                            </span>
                          )}
                          <h5 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                            {note.title}
                          </h5>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            {note.category || 'Geral'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteNote(note.id)}
                          className="opacity-70 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#252525] cursor-pointer"
                          title="Excluir nota"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {note.content}
                      </p>

                      <div className="text-[10px] text-gray-400 dark:text-[#666] flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-[#222]">
                        <Calendar size={10} />
                        <span>{new Date(note.createdAt).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Note Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1 border-t border-gray-100 dark:border-[#222]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={14} className="text-blue-500" />
                  {lang === 'pt' ? 'Adicionar Nova Anotação' : 'Add New Note'}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={lang === 'pt' ? 'Título da nota (ex: Roteiro, Checklist)...' : 'Note title...'}
                    className="w-full bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-[#2b2b2b] text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-[#2b2b2b] text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={lang === 'pt' ? 'Escreva os detalhes, orientações ou checklist do projeto...' : 'Write note details...'}
                  className="w-full bg-gray-50 dark:bg-[#1c1c1c] border border-gray-300 dark:border-[#2b2b2b] text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-gray-300 dark:border-[#333] text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <span>{lang === 'pt' ? 'Fixar nota no topo' : 'Pin note to top'}</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors cursor-pointer"
                  >
                    {lang === 'pt' ? 'Fechar' : 'Close'}
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving || !title.trim() || !content.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>{lang === 'pt' ? 'Salvando...' : 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>{lang === 'pt' ? 'Salvar Nota' : 'Save Note'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

