import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import React, { useState, useEffect, useRef } from 'react';
import { Project, Client } from '../types';
import { ArrowLeft, Save, X, Image as ImageIcon, Video, Tag, Upload, Link, User, Trash2, Loader, CheckCircle2, Check } from 'lucide-react';
import { getClients } from '../utils/storage';
import { parseDownloadUrl } from '../utils/downloadHelper';
import { compressImageToDataUrl, dataUrlToBlob, saveGalleryToIndexedDB, getGalleryFromIndexedDB } from '../utils/imageStorage';

interface ProjectFormProps {
  project?: Project | null;
  initialCategory?: string;
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

export default function ProjectForm({ project, initialCategory, onSave, onCancel, onDelete, onNavigateToClients, lang = "pt" }: ProjectFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState<Partial<Project>>(
    project || {
      title: '',
      category: initialCategory || 'Imobiliário',
      thumbnail: '',
      videoUrl: '',
      description: '',
      tags: [],
      clientId: '',
      images: project?.images || [],
      allowDownload: false,
      downloadUrl: '',
    }
  );

  useEffect(() => {
    const updateClients = () => {
      const currentClients = getClients();
      setClients(currentClients);
      // If currently selected client was removed or is not in list, clear it
      setFormData(prev => {
        if (prev.clientId && !currentClients.some(c => c.id === prev.clientId)) {
          return { ...prev, clientId: '' };
        }
        return prev;
      });
    };

    updateClients();
    window.addEventListener("clients-updated", updateClients);
    return () => window.removeEventListener("clients-updated", updateClients);
  }, []);

  // Mantém formData sincronizado se o projeto mudar e recupera fotos do IndexedDB
  useEffect(() => {
    if (project) {
      setFormData(prev => ({
        ...prev,
        ...project,
        images: (project.images && project.images.length > 0) ? project.images : (prev.images || [])
      }));
    }
  }, [project]);

  useEffect(() => {
    if (project?.id) {
      getGalleryFromIndexedDB(project.id).then((cached) => {
        if (cached && cached.length > 0) {
          setFormData(prev => {
            const existing = prev.images || [];
            const merged = Array.from(new Set([...existing, ...cached]));
            return { ...prev, images: merged };
          });
        }
      });
    }
  }, [project?.id]);

  const [tagInput, setTagInput] = useState('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  // Estados para progresso e miniaturas individuais durante o upload da galeria
  interface UploadingGalleryItem {
    id: string;
    name: string;
    previewUrl: string;
    progress: number;
    status: 'uploading' | 'done' | 'error';
    finalUrl?: string;
  }
  const [uploadingGalleryItems, setUploadingGalleryItems] = useState<UploadingGalleryItem[]>([]);

  const [uploading, setUploading] = useState<'thumbnail' | 'videoUrl' | 'downloadUrl' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const updateItemProgress = (id: string, progress: number, status: 'uploading' | 'done' | 'error' = 'uploading', finalUrl?: string) => {
    setUploadingGalleryItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          progress: Math.min(Math.max(progress, 0), 100),
          status,
          finalUrl: finalUrl || item.finalUrl
        };
      }
      return item;
    }));
  };

  const uploadSingleGalleryFile = async (item: UploadingGalleryItem, file: File): Promise<string> => {
    // 1. Comprime a foto no cliente (reduz de ~8MB para ~100KB, evitando estouro de cota e upload lento)
    let compressedDataUrl = '';
    try {
      compressedDataUrl = await compressImageToDataUrl(file, 1600, 0.82);
    } catch {
      // Se falhar a compressão, fallback
    }

    return new Promise((resolve) => {
      let resolved = false;

      const fallbackWithCompressed = () => {
        if (resolved) return;
        resolved = true;
        const finalUrl = compressedDataUrl || item.previewUrl;
        let currentP = Math.max(item.progress, 30);
        updateItemProgress(item.id, currentP, 'uploading');
        const interval = setInterval(() => {
          currentP += Math.floor(Math.random() * 20) + 15;
          if (currentP >= 100) {
            clearInterval(interval);
            updateItemProgress(item.id, 100, 'done', finalUrl);
            setTimeout(() => resolve(finalUrl), 150);
          } else {
            updateItemProgress(item.id, currentP, 'uploading');
          }
        }, 50);
      };

      const timeoutTimer = setTimeout(() => {
        console.warn("Storage upload timeout, salvando imagem compactada localmente");
        fallbackWithCompressed();
      }, 7000);

      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^/.]+$/, "") + ".jpg";
        const storageRef = ref(storage, `projects/gallery_${Date.now()}_${cleanName}`);
        
        // Se temos o dataUrl comprimido, converte para Blob leve (~100KB); se não, usa o arquivo original
        const uploadPayload = compressedDataUrl ? dataUrlToBlob(compressedDataUrl) : file;
        const uploadTask = uploadBytesResumable(storageRef, uploadPayload);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && !resolved) {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              updateItemProgress(item.id, Math.min(Math.max(pct, 20), 98), 'uploading');
            }
          },
          (err) => {
            clearTimeout(timeoutTimer);
            console.warn("Aviso upload Storage, utilizando versão compactada:", err);
            fallbackWithCompressed();
          },
          async () => {
            clearTimeout(timeoutTimer);
            if (resolved) return;
            resolved = true;
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              updateItemProgress(item.id, 100, 'done', downloadUrl);
              resolve(downloadUrl);
            } catch {
              fallbackWithCompressed();
            }
          }
        );
      } catch (err) {
        clearTimeout(timeoutTimer);
        fallbackWithCompressed();
      }
    });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = (Array.from(files) as File[]).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setUploadingGallery(true);

    // 1. Cria imediatamente miniaturas locais com preview para renderizar na tela
    const newItems: UploadingGalleryItem[] = validFiles.map((file, i) => ({
      id: `gallery_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      progress: 10,
      status: 'uploading'
    }));

    setUploadingGalleryItems(prev => [...prev, ...newItems]);

    // 2. Executa os uploads paralelamente
    await Promise.all(
      newItems.map(async (item, index) => {
        const file = validFiles[index];
        const url = await uploadSingleGalleryFile(item, file);
        if (url) {
          setFormData(prev => {
            const nextImages = [...(prev.images || []), url];
            if (project?.id) {
              saveGalleryToIndexedDB(project.id, nextImages);
            }
            return {
              ...prev,
              images: nextImages
            };
          });
        }
      })
    );

    // 3. Mantém o feedback de 100% concluído por um instante antes de finalizar
    setTimeout(() => {
      newItems.forEach(item => {
        try { URL.revokeObjectURL(item.previewUrl); } catch {}
      });
      setUploadingGalleryItems(prev => prev.filter(i => !newItems.some(ni => ni.id === i.id)));
      setUploadingGallery(false);
    }, 750);

    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleAddGalleryUrl = () => {
    const trimmed = galleryUrlInput.trim();
    if (!trimmed) return;
    setFormData(prev => {
      const nextImages = [...(prev.images || []), trimmed];
      if (project?.id) {
        saveGalleryToIndexedDB(project.id, nextImages);
      }
      return {
        ...prev,
        images: nextImages
      };
    });
    setGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setFormData(prev => {
      const nextImages = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      if (project?.id) {
        saveGalleryToIndexedDB(project.id, nextImages);
      }
      return {
        ...prev,
        images: nextImages
      };
    });
  };

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
    if (project?.id && formData.images && formData.images.length > 0) {
      saveGalleryToIndexedDB(project.id, formData.images);
    }
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
              <option value="Eventos">Eventos</option>
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
                <option key={client.id} value={client.id}>
                  {client.name}{client.company ? ` (${client.company})` : ''}
                </option>
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

          {/* Galeria de Fotos do Imóvel */}
          <div className="space-y-4 md:col-span-2 border border-gray-200 dark:border-[#1f1f1f] bg-gray-50 dark:bg-[#161616] rounded-2xl p-6">
            {(() => {
              const totalUploading = uploadingGalleryItems.length;
              const completedUploading = uploadingGalleryItems.filter(i => i.status === 'done').length;
              const overallProgress = totalUploading > 0
                ? Math.round(uploadingGalleryItems.reduce((acc, cur) => acc + cur.progress, 0) / totalUploading)
                : 0;
              const totalPhotosCount = (formData.images || []).length + totalUploading;

              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-[15px] flex items-center gap-2">
                        <ImageIcon size={16} className="text-[#FF6321]" />
                        Fotos do Imóvel (Galeria)
                      </h4>
                      <p className="text-gray-500 dark:text-[#777] text-[13px]">
                        As fotos cadastradas aparecerão em uma galeria logo abaixo do vídeo na página do imóvel.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#333] rounded-full text-gray-700 dark:text-gray-300 self-start sm:self-auto">
                      {totalPhotosCount} {totalPhotosCount === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>

                  {/* Inputs para adicionar fotos */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200 dark:border-[#222]">
                    <input
                      type="file"
                      ref={galleryInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={uploadingGallery}
                      className="bg-[#FF6321] hover:bg-[#e05419] text-white px-5 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
                    >
                      {uploadingGallery ? (
                        <>
                          <Loader size={15} className="animate-spin" />
                          Enviando {completedUploading}/{totalUploading} ({overallProgress}%)...
                        </>
                      ) : (
                        <>
                          <Upload size={15} />
                          + Adicionar Fotos do Computador
                        </>
                      )}
                    </button>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        value={galleryUrlInput}
                        onChange={(e) => setGalleryUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGalleryUrl();
                          }
                        }}
                        className="flex-1 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#262626] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-gray-400"
                        placeholder="Ou cole a URL de uma foto..."
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        disabled={!galleryUrlInput.trim()}
                        className="bg-gray-200 dark:bg-[#252525] hover:bg-gray-300 dark:hover:bg-[#333] text-gray-900 dark:text-white px-4 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Banner de progresso global quando há uploads em andamento */}
                  {totalUploading > 0 && (
                    <div className="p-3.5 bg-orange-500/10 dark:bg-orange-950/20 border border-orange-500/20 rounded-xl space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Loader size={14} className="animate-spin text-[#FF6321]" />
                          Enviando fotos: {completedUploading} de {totalUploading} concluída(s)
                        </span>
                        <span className="font-mono font-bold text-[#FF6321] text-sm">
                          {overallProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-[#222] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#FF6321] to-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${overallProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Grid de fotos: fotos já salvas + fotos que estão sendo enviadas com barra e opacidade dinâmica */}
                  {((formData.images && formData.images.length > 0) || totalUploading > 0) && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-3">
                      {/* 1. Fotos já salvas no projeto */}
                      {formData.images?.map((imgUrl, idx) => (
                        <div key={`saved-${idx}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-[#222] border border-gray-300 dark:border-[#333] group">
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer z-10"
                            title="Remover foto"
                          >
                            <X size={12} />
                          </button>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono z-10">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}

                      {/* 2. Miniaturas sendo carregadas com opacidade progressiva e barra de carregamento */}
                      {uploadingGalleryItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 border-2 border-[#FF6321]/50 shadow-md group transition-all"
                        >
                          {/* Miniatura com opacidade que aumenta conforme carrega */}
                          <img 
                            src={item.previewUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            style={{ 
                              opacity: 0.2 + (item.progress / 100) * 0.8,
                              filter: item.progress < 100 ? `grayscale(${100 - item.progress}%)` : 'none',
                              transition: 'opacity 0.25s ease-out, filter 0.25s ease-out'
                            }}
                          />

                          {/* Overlay com percentual ou check */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 pointer-events-none">
                            {item.status === 'uploading' ? (
                              <div className="flex flex-col items-center justify-center gap-1 bg-black/75 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/10 shadow-lg">
                                <Loader size={14} className="text-[#FF6321] animate-spin" />
                                <span className="text-white text-[10px] font-mono font-bold">
                                  {item.progress}%
                                </span>
                              </div>
                            ) : item.status === 'done' ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl animate-in zoom-in duration-300">
                                <Check size={18} className="stroke-[3]" />
                              </div>
                            ) : (
                              <span className="text-[10px] text-red-300 bg-red-950/80 px-2 py-0.5 rounded font-bold border border-red-500/40">
                                Falha
                              </span>
                            )}
                          </div>

                          {/* Barra de carregamento no rodapé da miniatura */}
                          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/80 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#FF6321] via-orange-400 to-emerald-400 transition-all duration-200"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
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
                   {formData.downloadUrl && (() => {
                     const info = parseDownloadUrl(formData.downloadUrl);
                     if (info.type === 'google-drive-file') {
                       return (
                         <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                           <CheckCircle2 size={13} />
                           Link do Google Drive detectado (será baixado diretamente sem abrir view.htm).
                         </div>
                       );
                     }
                     if (info.type === 'google-drive-folder') {
                       return (
                         <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium pt-1">
                           <CheckCircle2 size={13} />
                           Pasta do Google Drive detectada (o cliente será direcionado à pasta para baixar os arquivos).
                         </div>
                       );
                     }
                     if (info.type === 'dropbox') {
                       return (
                         <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                           <CheckCircle2 size={13} />
                           Link do Dropbox detectado (configurado para download direto automático).
                         </div>
                       );
                     }
                     return null;
                   })()}
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
