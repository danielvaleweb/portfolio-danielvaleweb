import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, ExternalLink, FileText, Video, Image, Music, Archive, Search, Folder } from 'lucide-react';
import { FileAsset } from '../../types';
import { getFiles, addFile, deleteFile } from '../../utils/storage';

interface FilesTabProps {
  lang: 'pt' | 'en';
}

export const FilesTab: React.FC<FilesTabProps> = ({ lang }) => {
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('Todas');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [size, setSize] = useState('24.5 MB');
  const [type, setType] = useState<'video' | 'image' | 'document' | 'audio' | 'archive'>('video');
  const [category, setCategory] = useState<'Imobiliário' | 'Publicidade' | 'Institucional' | 'Geral'>('Imobiliário');
  const [projectName, setProjectName] = useState('');

  const reloadFiles = () => {
    setFiles(getFiles());
  };

  useEffect(() => {
    reloadFiles();
    window.addEventListener('files-updated', reloadFiles);
    return () => window.removeEventListener('files-updated', reloadFiles);
  }, []);

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addFile({
      name,
      url: url.trim() || '#',
      size: size.trim() || '12 MB',
      type,
      category,
      projectName: projectName.trim() || undefined
    });

    setName('');
    setUrl('');
    setProjectName('');
    setIsUploading(false);
    reloadFiles();
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'pt' ? 'Remover este arquivo da biblioteca?' : 'Delete this file?')) {
      deleteFile(id);
      reloadFiles();
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <Video size={18} className="text-blue-500" />;
      case 'image':
        return <Image size={18} className="text-emerald-500" />;
      case 'audio':
        return <Music size={18} className="text-purple-500" />;
      case 'archive':
        return <Archive size={18} className="text-amber-500" />;
      default:
        return <FileText size={18} className="text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesCat = selectedCat === 'Todas' || f.category === selectedCat;
    const matchesType = selectedType === 'todos' || f.type === selectedType;
    const matchesSearch = !search || 
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.projectName && f.projectName.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['Todas', 'Imobiliário', 'Publicidade', 'Institucional'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedCat === cat
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="h-4 w-px bg-gray-300 dark:bg-[#333] mx-1 hidden sm:block" />

          {['todos', 'video', 'image', 'document', 'audio'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors cursor-pointer ${
                selectedType === t
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
              }`}
            >
              {t === 'todos' ? 'Todos' : t === 'video' ? 'Vídeos' : t === 'image' ? 'Fotos' : t === 'document' ? 'Documentos' : 'Áudios'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'pt' ? 'Buscar arquivo...' : 'Search files...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] rounded-full text-xs pl-9 pr-4 py-2 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-gray-400 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={() => setIsUploading(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={15} />
            {lang === 'pt' ? 'Adicionar Arquivo' : 'Add File'}
          </button>
        </div>
      </div>

      {/* Upload / Add File Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-black dark:text-white mb-4">
              {lang === 'pt' ? 'Cadastrar Novo Arquivo de Projeto' : 'Add Project File'}
            </h3>
            <form onSubmit={handleAddFile} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  {lang === 'pt' ? 'Nome do Arquivo' : 'File Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Master_4K_Casa_Alphaville.mp4"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-sm text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                    {lang === 'pt' ? 'Tipo de Mídia' : 'Media Type'}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="video">Vídeo 4K / Corte</option>
                    <option value="image">Fotos Drone / Still</option>
                    <option value="document">Roteiro / Documento</option>
                    <option value="audio">Áudio / Trilha Sonora</option>
                    <option value="archive">Arquivo Compactado (ZIP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                    {lang === 'pt' ? 'Categoria' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Imobiliário">Imobiliário</option>
                    <option value="Publicidade">Publicidade</option>
                    <option value="Institucional">Institucional</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                    {lang === 'pt' ? 'Tamanho Estimado' : 'Size'}
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="Ex: 850 MB"
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                    {lang === 'pt' ? 'Projeto Vinculado' : 'Project'}
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex: Casa Alphaville"
                    className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1.5">
                  {lang === 'pt' ? 'Link de Download ou URL na Nuvem' : 'Cloud / Download URL'}
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://storage.googleapis.com/... ou Google Drive"
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-[#262626] text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#202020] cursor-pointer"
                >
                  {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {lang === 'pt' ? 'Cadastrar Arquivo' : 'Register File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Table / List */}
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#1c1c1c] text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-[#141414]/50">
                <th className="py-3.5 px-6">Arquivo</th>
                <th className="py-3.5 px-4">Projeto & Categoria</th>
                <th className="py-3.5 px-4">Tamanho</th>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#1c1c1c] text-xs">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    {lang === 'pt' ? 'Nenhum arquivo encontrado.' : 'No files found.'}
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50/80 dark:hover:bg-[#171717] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1c1c1c] flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-black dark:text-white truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </p>
                          <span className="text-[10px] text-gray-400 capitalize">{file.type}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                          {file.projectName || 'Geral'}
                        </span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-[#202020] text-gray-600 dark:text-gray-400">
                          {file.category}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-gray-600 dark:text-gray-400 text-[11px]">
                      {file.size}
                    </td>

                    <td className="py-4 px-4 text-gray-400 text-[11px]">
                      {new Date(file.uploadedAt).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US')}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {file.url && file.url !== '#' && (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#202020] text-gray-600 dark:text-gray-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                            title="Baixar / Abrir Arquivo"
                          >
                            <Download size={13} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#202020] text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          title="Excluir arquivo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
