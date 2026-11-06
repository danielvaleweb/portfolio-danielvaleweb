import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pin, Search, Tag, Calendar, Folder, Check } from 'lucide-react';
import { Note } from '../../types';
import { getNotes, addNote, updateNote, deleteNote } from '../../utils/storage';

interface NotesTabProps {
  lang: 'pt' | 'en';
}

export const NotesTab: React.FC<NotesTabProps> = ({ lang }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Geral');
  const [projectName, setProjectName] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const categories = ['Todas', 'Roteiros', 'Ideias', 'Reuniões', 'Geral'];

  const reloadNotes = () => {
    setNotes(getNotes());
  };

  useEffect(() => {
    reloadNotes();
    window.addEventListener('notes-updated', reloadNotes);
    return () => window.removeEventListener('notes-updated', reloadNotes);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title,
        content,
        category,
        projectName: projectName.trim() || undefined,
        isPinned
      });
      setEditingNote(null);
    } else {
      addNote({
        title,
        content,
        category,
        projectName: projectName.trim() || undefined,
        isPinned
      });
    }

    setTitle('');
    setContent('');
    setCategory('Geral');
    setProjectName('');
    setIsPinned(false);
    setIsCreating(false);
    reloadNotes();
  };

  const handleStartEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || 'Geral');
    setProjectName(note.projectName || '');
    setIsPinned(!!note.isPinned);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'pt' ? 'Excluir esta anotação?' : 'Delete this note?')) {
      deleteNote(id);
      reloadNotes();
    }
  };

  const handleTogglePin = (note: Note) => {
    updateNote(note.id, { isPinned: !note.isPinned });
    reloadNotes();
  };

  const filteredNotes = notes.filter(n => {
    const matchesCategory = selectedCategory === 'Todas' || n.category === selectedCategory;
    const matchesSearch = !search || 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.projectName && n.projectName.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'pt' ? 'Buscar anotações...' : 'Search notes...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] rounded-full text-xs pl-9 pr-4 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 w-52 sm:w-64"
            />
          </div>

          <button
            onClick={() => {
              setEditingNote(null);
              setTitle('');
              setContent('');
              setCategory('Geral');
              setProjectName('');
              setIsPinned(false);
              setIsCreating(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            {lang === 'pt' ? 'Nova Nota' : 'New Note'}
          </button>
        </div>
      </div>

      {/* Note Creation / Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              {editingNote ? (lang === 'pt' ? 'Editar Anotação' : 'Edit Note') : (lang === 'pt' ? 'Nova Anotação' : 'New Note')}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  {lang === 'pt' ? 'Título da Nota' : 'Note Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Checklist de Filmagem Casa Alphaville"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                    {lang === 'pt' ? 'Categoria' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Roteiros">Roteiros</option>
                    <option value="Ideias">Ideias</option>
                    <option value="Reuniões">Reuniões</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                    {lang === 'pt' ? 'Vincular a Projeto (Opcional)' : 'Link to Project'}
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex: Casa Alphaville"
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  {lang === 'pt' ? 'Conteúdo da Anotação' : 'Content'}
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva os detalhes, especificações técnicas, lembretes de gravação..."
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNote"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded accent-blue-600"
                />
                <label htmlFor="pinNote" className="text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                  {lang === 'pt' ? 'Fixar esta nota no topo' : 'Pin note to top'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-[#262626] text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202020] cursor-pointer"
                >
                  {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {lang === 'pt' ? 'Salvar Nota' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {lang === 'pt' ? 'Nenhuma anotação encontrada.' : 'No notes found.'}
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold"
          >
            <Plus size={14} /> {lang === 'pt' ? 'Criar Primeira Nota' : 'Create First Note'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`group bg-white dark:bg-[#111] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                note.isPinned 
                  ? 'border-blue-500/40 dark:border-blue-500/40 bg-blue-500/[0.02]' 
                  : 'border-gray-200 dark:border-[#222]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-[#222] text-gray-700 dark:text-gray-300">
                    <Tag size={10} />
                    {note.category || 'Geral'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePin(note)}
                      title={note.isPinned ? "Desafixar" : "Fixar no topo"}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        note.isPinned
                          ? 'text-blue-500 hover:text-blue-600'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                      }`}
                    >
                      <Pin size={13} className={note.isPinned ? 'fill-blue-500' : ''} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      title="Excluir nota"
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h4 
                  onClick={() => handleStartEdit(note)}
                  className="font-bold text-sm text-black dark:text-white hover:text-blue-500 transition-colors cursor-pointer mb-2"
                >
                  {note.title}
                </h4>

                <p 
                  onClick={() => handleStartEdit(note)}
                  className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap line-clamp-4 cursor-pointer"
                >
                  {note.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1e1e1e] flex items-center justify-between text-[11px] text-gray-400">
                {note.projectName ? (
                  <span className="inline-flex items-center gap-1 text-blue-500 font-medium">
                    <Folder size={11} />
                    {note.projectName}
                  </span>
                ) : (
                  <span>Geral</span>
                )}
                <span>{new Date(note.updatedAt).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
