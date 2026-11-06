import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Trash2, Tag, ChevronRight, ArrowLeft } from 'lucide-react';
import { KnowledgeArticle } from '../../types';
import { getKnowledgeArticles, addKnowledgeArticle, deleteKnowledgeArticle } from '../../utils/storage';

interface KnowledgeBaseTabProps {
  lang: 'pt' | 'en';
}

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({ lang }) => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Todas');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cinematografia');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('Sony FX3, Drone, 4K');

  const reload = () => {
    setArticles(getKnowledgeArticles());
  };

  useEffect(() => {
    reload();
    window.addEventListener('knowledge-updated', reload);
    return () => window.removeEventListener('knowledge-updated', reload);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const excerpt = content.trim().slice(0, 140) + (content.length > 140 ? '...' : '');
    const words = content.trim().split(/\s+/).length;
    const readMinutes = Math.max(1, Math.ceil(words / 180));
    const readTime = `${readMinutes} min`;

    addKnowledgeArticle({
      title: title.trim(),
      category: category as any,
      excerpt,
      content: content.trim(),
      readTime,
      tags
    });

    setTitle('');
    setContent('');
    setTagsInput('');
    setIsAdding(false);
    reload();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este artigo da Base de Conhecimento?')) {
      deleteKnowledgeArticle(id);
      if (selectedArticle?.id === id) {
        setSelectedArticle(null);
      }
      reload();
    }
  };

  const filtered = articles.filter(art => {
    const matchesTag = selectedTag === 'Todas' || art.tags.includes(selectedTag) || art.category === selectedTag;
    const matchesSearch = !search ||
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.content.toLowerCase().includes(search.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const allTags = ['Todas', 'Drone', 'Cores', 'Equipamento', 'Workflow', 'Áudio'];

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12">
      {/* Top Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'pt' ? 'Pesquisar na base...' : 'Search wiki...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] rounded-full text-xs pl-9 pr-4 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            {lang === 'pt' ? 'Novo Artigo' : 'New Article'}
          </button>
        </div>
      </div>

      {/* Article Detail View */}
      {selectedArticle ? (
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl p-8 shadow-sm">
          <button
            onClick={() => setSelectedArticle(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline mb-6 cursor-pointer"
          >
            <ArrowLeft size={14} /> Voltar para artigos
          </button>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedArticle.category}
              </span>
              <h2 className="text-2xl font-bold text-black dark:text-white mt-3 mb-2">
                {selectedArticle.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {selectedArticle.tags.map(t => (
                  <span key={t} className="text-[10px] text-gray-500 bg-gray-100 dark:bg-[#1f1f1f] px-2 py-0.5 rounded">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleDelete(selectedArticle.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Excluir artigo"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-[#1e1e1e] text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
            {selectedArticle.content}
          </div>
        </div>
      ) : (
        /* Article Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-gray-400 dark:hover:border-[#444] cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(art.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-black dark:text-white mb-2 group-hover:text-blue-500 transition-colors">
                  {art.title}
                </h4>

                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                  {art.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1e1e1e] flex items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {art.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] text-gray-500 bg-gray-100 dark:bg-[#202020] px-2 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-blue-500 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Ler <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              {lang === 'pt' ? 'Cadastrar Artigo na Base' : 'New Knowledge Article'}
            </h3>
            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Título do Artigo *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Parâmetros de Exportação 4K para Instagram e YouTube"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Cinematografia">Cinematografia</option>
                    <option value="Drone & Voo">Drone & Voo</option>
                    <option value="Pós-Produção & Cor">Pós-Produção & Cor</option>
                    <option value="Áudio & Foley">Áudio & Foley</option>
                    <option value="Equipamentos">Equipamentos</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Drone, SARPAS, 4K"
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Conteúdo do Artigo *
                </label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva as orientações técnicas, tabelas de valores, referências..."
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-[#262626] text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  Publicar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
