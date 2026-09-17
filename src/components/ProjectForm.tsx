import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import React, { useState, useEffect, useRef } from 'react';
import { Project, Client } from '../types';
import { ArrowLeft, Save, X, Image as ImageIcon, Video, Tag, Upload, Link, User, Trash2, Loader } from 'lucide-react';
import { getClients } from '../utils/storage';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (data: Partial<Project>) => void;
  onCancel: () => void;
  onDelete?: (project: Project) => void;
  onNavigateToClients?: () => void;
  lang?: "pt" | "en";
}

const t = {
  en: {
    editProject: 'Edit Project',
    newProject: 'New Project',
    basicInfo: 'Basic Information',
    title: 'Title',
    category: 'Category',
    selectCategory: 'Select category...',
    description: 'Synopsis / Description',
    client: 'Client',
    selectClient: 'Select a Client...',
    thumbnail: 'Thumbnail URL',
    videoUrl: 'Video URL (YouTube/Vimeo)',
    downloadSettings: 'Download Settings',
    allowDownloadDesc: 'Allow users to download this project using an access code.',
    fileUrl: 'File / Download URL',
    upload: 'Upload',
    generatedCode: 'Generated Access Code',
    evaluationLink: 'Evaluation Link',
    openLink: 'Open Link',
    generatedAfterSave: 'Access code and link will be generated after saving.',
    tags: 'Tags',
    addTag: 'Add a tag and press Enter',
    add: 'Add',
    cancel: 'Cancel',
    save: 'Save Project',
    deleteProject: 'Delete Project',
  },
  pt: {
    editProject: 'Editar Projeto',
    newProject: 'Novo Projeto',
    basicInfo: 'Informações Básicas',
    title: 'Título',
    category: 'Categoria',
    selectCategory: 'Selecione a categoria...',
    description: 'Sinopse / Descrição',
    client: 'Cliente',
    selectClient: 'Selecione um Cliente...',
    thumbnail: 'URL da Capa (Thumbnail)',
    videoUrl: 'URL do Vídeo (YouTube/Vimeo)',
    downloadSettings: 'Configurações de Download',
    allowDownloadDesc: 'Permitir que usuários baixem este projeto usando um código de acesso.',
    fileUrl: 'Arquivo / URL de Download',
    upload: 'Enviar',
    generatedCode: 'Código de Acesso Gerado',
    evaluationLink: 'Link de Avaliação',
    openLink: 'Abrir Link',
    generatedAfterSave: 'O código de acesso e link serão gerados ao salvar.',
    tags: 'Tags',
    addTag: 'Adicione uma tag e pressione Enter',
    add: 'Adicionar',
    cancel: 'Cancelar',
    save: 'Salvar Projeto',
    deleteProject: 'Excluir Projeto',
  }
};

export default function ProjectForm({ project, onSave, onCancel, onDelete, onNavigateToClients, lang = "pt" }: ProjectFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<Partial<Project>>(
    project || {
      title: '',
      category: 'Imobiliário',
      thumbnail: '',
      videoUrl: '',
      description: '',
      tags: [],
      clientId: '',
      allowDownload: false,
      downloadUrl: '',
    }
  );

  useEffect(() => {
    setClients(getClients());
  }, []);

  const [tagInput, setTagInput] = useState('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState<'thumbnail' | 'videoUrl' | 'downloadUrl' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'thumbnail' | 'videoUrl' | 'downloadUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(fieldName);
    setUploadProgress(0);

    const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(null);
        alert("Upload failed. Try again.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => ({ ...prev, [fieldName]: downloadURL }));
          setUploading(null);
        });
      }
    );
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-3xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] flex items-center justify-center text-gray-500 dark:text-[#777] hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-[#222] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">
            {project ? t[lang].editProject : t[lang].newProject}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">{t[lang].title}</label>
            <input 
              required
              type="text" 
              name="title"
              value={formData.title} 
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors"
              placeholder="Project Title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">{t[lang].category}</label>
            <select 
              name="category"
              value={formData.category} 
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors appearance-none"
            >
              <option value="Imobiliário">Imobiliário</option>
              <option value="Institucional">Institucional</option>
              <option value="Publicitário">Publicitário</option>
              <option value="Fotos">Fotos</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider">{t[lang].description}</label>
            <textarea 
              name="description"
              value={formData.description || ''} 
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors custom-scrollbar"
              placeholder={lang === 'pt' ? 'Breve sinopse do projeto...' : 'Brief synopsis of the project...'}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center gap-2">
              <User size={14} />
              Client
            </label>
            <select 
              name="clientId"
              value={formData.clientId || ''} 
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors appearance-none"
            >
              <option value="">{t[lang].selectClient}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <button 
                type="button" 
                onClick={onNavigateToClients}
                className="text-[12px] font-bold text-[#3B82F6] hover:text-[#2563EB] text-left mt-2 block w-full"
              >
                + Adicionar novo cliente
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={14} />
              Thumbnail URL
            </label>
            <div className="flex gap-2">
              <input type="file" ref={thumbnailInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
              <input 
                type="url" 
                name="thumbnail"
              value={formData.thumbnail || ''} 
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors"
              placeholder="https://..."
              />
              <button 
                type="button" 
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={uploading === 'thumbnail'}
                className="bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {uploading === 'thumbnail' ? <><Loader size={16} className="animate-spin" /> {Math.round(uploadProgress)}%</> : <><Upload size={16} /> {t[lang].upload || 'Upload'}</>}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center gap-2">
              <Video size={14} />
              Video URL (YouTube/Vimeo)
            </label>
            <div className="flex gap-2">
              <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'videoUrl')} />
              <input 
                type="url" 
                name="videoUrl"
              value={formData.videoUrl || ''} 
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors"
              placeholder="https://youtube.com/..."
              />
              <button 
                type="button" 
                onClick={() => videoInputRef.current?.click()}
                disabled={uploading === 'videoUrl'}
                className="bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {uploading === 'videoUrl' ? <><Loader size={16} className="animate-spin" /> {Math.round(uploadProgress)}%</> : <><Upload size={16} /> {t[lang].upload || 'Upload'}</>}
              </button>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2 border border-gray-200 dark:border-[#1f1f1f] bg-gray-50 dark:bg-[#161616] rounded-2xl p-6">
             <div className="flex items-center justify-between mb-4">
               <div>
                 <h4 className="text-gray-900 dark:text-white font-bold text-[15px]">{t[lang].downloadSettings}</h4>
                 <p className="text-gray-500 dark:text-[#777] text-[13px]">{t[lang].allowDownloadDesc}</p>
               </div>
               <label className="flex items-center cursor-pointer">
                 <div className="relative">
                   <input type="checkbox" name="allowDownload" className="sr-only" checked={formData.allowDownload || false} onChange={handleChange} />
                   <div className={`block w-14 h-8 rounded-full transition-colors ${formData.allowDownload ? 'bg-[#EAB308]' : 'bg-gray-200 dark:bg-[#222]'}`}></div>
                   <div className={`dot absolute left-1 top-1 bg-white dark:bg-[#1a1a1a] w-6 h-6 rounded-full transition-transform ${formData.allowDownload ? 'transform translate-x-6' : ''}`}></div>
                 </div>
               </label>
             </div>
             
             {formData.allowDownload && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 pt-2 border-t border-gray-300 dark:border-[#222]">
                 <div className="flex flex-col gap-2">
                   <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center gap-2">
                     <Upload size={14} />
                     {t[lang].fileUrl}
                   </label>
                   <div className="flex gap-2">
                     <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'downloadUrl')} />
                     <input 
                       type="url" 
                       name="downloadUrl"
                       value={formData.downloadUrl || ''} 
                       onChange={handleChange}
                       className="flex-1 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors"
                       placeholder="https://drive.google.com/..."
                     />
                     <button 
                       type="button" 
                       onClick={() => fileInputRef.current?.click()}
                       disabled={uploading === 'downloadUrl'}
                       className="bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                     >
                       {uploading === 'downloadUrl' ? <><Loader size={16} className="animate-spin" /> {Math.round(uploadProgress)}%</> : <><Upload size={16} /> {t[lang].upload || 'Upload'}</>}
                     </button>
                   </div>
                 </div>
                 
                 {project?.downloadCode && (
                   <div className="bg-gray-100 dark:bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex justify-between items-center mt-2">
                     <div>
                       <p className="text-[11px] text-gray-500 dark:text-[#888] font-bold uppercase mb-1">{t[lang].generatedCode}</p>
                       <p className="text-xl text-gray-900 dark:text-white font-mono font-bold tracking-widest">{project.downloadCode}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[11px] text-gray-500 dark:text-[#888] font-bold uppercase mb-1">{t[lang].evaluationLink}</p>
                       <a href={`/avaliar/${project.id}`} target="_blank" rel="noreferrer" className="text-[#3B82F6] hover:text-[#60A5FA] text-[13px] flex items-center gap-1">
                         <Link size={12} /> {t[lang].openLink}
                       </a>
                     </div>
                   </div>
                 )}
                 {!project && (
                   <p className="text-[12px] text-gray-500 dark:text-[#777] italic">{t[lang].generatedAfterSave}</p>
                 )}
               </div>
             )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center gap-2">
              <Tag size={14} />
              Tags
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors"
                placeholder={t[lang].addTag}
              />
              <button 
                type="button"
                onClick={handleAddTag}
                className="bg-gray-200 dark:bg-[#222] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-6 rounded-xl font-bold transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 bg-gray-200 dark:bg-[#222] border border-[#333] text-[12px] font-semibold text-gray-900 dark:text-white px-3 py-1.5 rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-gray-500 dark:text-[#888] hover:text-gray-900 dark:text-white">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-[#1f1f1f]">
          <div>
            {project && onDelete && (
              <button 
                type="button"
                onClick={() => onDelete(project)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-500/30 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-[13px] font-bold transition-all cursor-pointer shadow-xs"
              >
                <Trash2 size={15} />
                {t[lang].deleteProject}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-full border border-gray-300 dark:border-[#222] text-gray-600 dark:text-[#ccc] text-[13px] font-bold hover:bg-gray-100 dark:bg-[#1a1a1a] hover:text-gray-900 dark:text-white transition-colors cursor-pointer"
            >
              {t[lang].cancel}
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm cursor-pointer"
            >
              <Save size={16} strokeWidth={2.5} />
              {t[lang].save}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
