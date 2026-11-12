import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import React, { useState, useEffect, useRef } from 'react';
import { Project, Client } from '../types';
import { ArrowLeft, Save, X, Image as ImageIcon, Video, Tag, Upload, Link, User, Trash2, Loader, CheckCircle2, Check, Globe, EyeOff, DollarSign, Cloud, HardDrive, FileVideo } from 'lucide-react';
import { getClients, updateProject, getProjectFinancialTransaction } from '../utils/storage';
import { parseDownloadUrl } from '../utils/downloadHelper';
import { compressImageToDataUrl, dataUrlToBlob, saveGalleryToIndexedDB, getGalleryFromIndexedDB } from '../utils/imageStorage';

interface ProjectFormProps {
  project?: Project | null;
  initialCategory?: string;
  onSave: (data: Partial<Project>, paymentStatus?: 'paid' | 'pending') => void;
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
    project ? {
      ...project,
      visibility: project.visibility || 'public',
      showClientInfo: project.showClientInfo !== undefined ? project.showClientInfo : Boolean(project.clientId),
      images: project.images || [],
    } : {
      title: '',
      category: initialCategory || 'Imobiliário',
      thumbnail: '',
      videoUrl: '',
      description: '',
      tags: [],
      clientId: '',
      showClientInfo: true,
      visibility: 'public',
      images: [],
      allowDownload: false,
      downloadUrl: '',
      price: project?.price || undefined,
    }
  );

  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [showExternalLink, setShowExternalLink] = useState(false);

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
        showClientInfo: project.showClientInfo !== undefined ? project.showClientInfo : Boolean(project.clientId),
        images: (project.images && project.images.length > 0) ? project.images : (prev.images || [])
      }));
      const existingTx = getProjectFinancialTransaction(project.id);
      if (existingTx) {
        setPaymentStatus(existingTx.status);
      }
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

  const uploadSingleGalleryFile = async (item: UploadingGalleryItem, file: File, permanentDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      let resolved = false;

      const finishWithPermanentUrl = () => {
        if (resolved) return;
        resolved = true;
        let currentP = Math.max(item.progress, 40);
        updateItemProgress(item.id, currentP, 'uploading');
        const interval = setInterval(() => {
          currentP += Math.floor(Math.random() * 20) + 15;
          if (currentP >= 100) {
            clearInterval(interval);
            updateItemProgress(item.id, 100, 'done', permanentDataUrl);
            setTimeout(() => resolve(permanentDataUrl), 150);
          } else {
            updateItemProgress(item.id, currentP, 'uploading');
          }
        }, 50);
      };

      const timeoutTimer = setTimeout(() => {
        finishWithPermanentUrl();
      }, 5000);

      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^/.]+$/, "") + ".jpg";
        const storageRef = ref(storage, `projects/gallery_${Date.now()}_${cleanName}`);
        
        // Se temos o dataUrl comprimido, converte para Blob leve (~80KB); se não, usa o arquivo original
        const uploadPayload = permanentDataUrl ? dataUrlToBlob(permanentDataUrl) : file;
        const uploadTask = uploadBytesResumable(storageRef, uploadPayload);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && !resolved) {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              updateItemProgress(item.id, Math.min(Math.max(pct, 25), 98), 'uploading');
            }
          },
          () => {
            clearTimeout(timeoutTimer);
            finishWithPermanentUrl();
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
              finishWithPermanentUrl();
            }
          }
        );
      } catch (err) {
        clearTimeout(timeoutTimer);
        finishWithPermanentUrl();
      }
    });
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = (Array.from(files) as File[]).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setUploadingGallery(true);

    // 1. Gera imediatamente dataUrl comprimido permanente para cada imagem (nunca usa blob: temporário)
    const itemsToUpload: { item: UploadingGalleryItem; file: File; dataUrl: string }[] = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const dataUrl = await compressImageToDataUrl(file, 1400, 0.78);
      const item: UploadingGalleryItem = {
        id: `gallery_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        previewUrl: dataUrl,
        progress: 30,
        status: 'uploading',
        finalUrl: dataUrl
      };
      itemsToUpload.push({ item, file, dataUrl });
    }

    setUploadingGalleryItems(prev => [...prev, ...itemsToUpload.map(x => x.item)]);

    // 2. Executa os uploads paralelamente e salva imediatamente no projeto
    await Promise.all(
      itemsToUpload.map(async ({ item, file, dataUrl }) => {
        const url = await uploadSingleGalleryFile(item, file, dataUrl);
        if (url) {
          setFormData(prev => {
            const nextImages = [...(prev.images || []), url];
            if (project?.id) {
              saveGalleryToIndexedDB(project.id, nextImages);
              updateProject(project.id, { images: nextImages });
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
      setUploadingGalleryItems(prev => prev.filter(i => !itemsToUpload.some(x => x.item.id === i.id)));
      setUploadingGallery(false);
    }, 700);

    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleAddGalleryUrl = () => {
    const trimmed = galleryUrlInput.trim();
    if (!trimmed) return;
    setFormData(prev => {
      const nextImages = [...(prev.images || []), trimmed];
      if (project?.id) {
        saveGalleryToIndexedDB(project.id, nextImages);
        updateProject(project.id, { images: nextImages });
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
        updateProject(project.id, { images: nextImages });
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

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = fieldName === 'downloadUrl' ? 'downloads' : 'projects';
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanFileName}`);

    const metadata = {
      contentType: file.type || (fieldName === 'downloadUrl' ? 'video/mp4' : 'application/octet-stream'),
      contentDisposition: `attachment; filename="${cleanFileName}"`,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(null);
        alert("Upload failed. Try again.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          let finalUrl = downloadURL;
          if (fieldName === 'downloadUrl') {
            const sep = downloadURL.includes('?') ? '&' : '?';
            finalUrl = `${downloadURL}${sep}response-content-disposition=attachment%3B%20filename%3D"${encodeURIComponent(cleanFileName)}"`;
          }
          setFormData((prev) => ({ ...prev, [fieldName]: finalUrl }));
          setUploading(null);
        });
      }
    );
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isPhoto = formData.category === 'Fotos' || Boolean(formData.isPhotoGallery);

    // Se for projeto de foto e faltar o título, define um padrão amigável sem exigir nada
    const cleanTitle = (formData.title || '').trim() || (isPhoto ? 'Ensaio Fotográfico' : 'Novo Projeto');

    // Se for projeto de foto e não tiver thumbnail definida, usa a primeira imagem da galeria
    let finalThumbnail = formData.thumbnail?.trim() || '';
    if (!finalThumbnail && formData.images && formData.images.length > 0) {
      finalThumbnail = formData.images[0];
    }

    const finalData: Partial<Project> = {
      ...formData,
      title: cleanTitle,
      thumbnail: finalThumbnail,
      isPhotoGallery: isPhoto,
      category: isPhoto ? 'Fotos' : (formData.category || 'Imobiliário'),
      // Se não selecionou cliente, desativa o card de cliente para não exibir vazio
      showClientInfo: formData.clientId ? Boolean(formData.showClientInfo) : false,
      videoUrl: formData.videoUrl?.trim() || '',
      description: formData.description?.trim() || '',
    };

    if (project?.id && formData.images && formData.images.length > 0) {
      saveGalleryToIndexedDB(project.id, formData.images);
      updateProject(project.id, { 
        images: formData.images, 
        isPhotoGallery: isPhoto,
        thumbnail: finalData.thumbnail,
        title: cleanTitle,
      });
    }
    onSave(finalData, paymentStatus);
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onCancel}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] border border-gray-200 dark:border-[#222] flex items-center justify-center text-gray-600 dark:text-[#777] hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
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
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center justify-between">
              <span>{t[lang].title}</span>
              {formData.category === 'Fotos' && (
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium normal-case tracking-normal">(opcional para fotos)</span>
              )}
            </label>
            <input 
              type="text" 
              name="title"
              value={formData.title || ''} 
              onChange={handleChange}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors"
              placeholder={formData.category === 'Fotos' ? (lang === 'pt' ? 'Ex: Ensaio Fotográfico (opcional)' : 'Photo Session Title (optional)') : 'Project Title'}
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
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center justify-between">
              <span>{t[lang].description}</span>
              {formData.category === 'Fotos' && (
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium normal-case tracking-normal">(opcional)</span>
              )}
            </label>
            <textarea 
              name="description"
              value={formData.description || ''} 
              onChange={handleChange}
              rows={3}
              className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#222] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-gray-400 dark:border-[#444] transition-colors custom-scrollbar"
              placeholder={formData.category === 'Fotos' ? (lang === 'pt' ? 'Sinopse ou observações (opcional)...' : 'Synopsis or notes (optional)...') : (lang === 'pt' ? 'Breve sinopse do projeto...' : 'Brief synopsis of the project...')}
            />
          </div>

          <div className="space-y-4 md:col-span-2 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] rounded-2xl p-5">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User size={14} />
                  {t[lang].client}
                </span>
                {formData.category === 'Fotos' && (
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium normal-case tracking-normal">(opcional)</span>
                )}
              </label>
              <select 
                name="clientId"
                value={formData.clientId || ''} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    clientId: val,
                    showClientInfo: val ? (prev.showClientInfo !== undefined ? prev.showClientInfo : true) : prev.showClientInfo,
                  }));
                }}
                className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 dark:border-[#444] transition-colors appearance-none text-sm"
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
                  className="text-[12px] font-bold text-[#3B82F6] hover:text-[#2563EB] text-left mt-1 block w-full cursor-pointer"
                >
                  + Adicionar novo cliente
                </button>
              )}
            </div>

            {/* Opção para ativar / desativar informações do cliente na página */}
            <div className="pt-3 border-t border-gray-200 dark:border-[#262626] flex items-center justify-between gap-4">
              <div>
                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white">
                  {lang === 'pt' ? 'Exibir informações do cliente na página' : 'Display client info on project page'}
                </h4>
                <p className="text-[12px] text-gray-500 dark:text-[#888] leading-tight mt-0.5">
                  {lang === 'pt' 
                    ? 'Ativa o card de contato com WhatsApp, Instagram e telefone do cliente na página do projeto.' 
                    : 'Show contact card with WhatsApp, Instagram, and phone on the project page.'}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input 
                  type="checkbox" 
                  name="showClientInfo" 
                  className="sr-only" 
                  checked={formData.showClientInfo !== false} 
                  onChange={handleChange} 
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${formData.showClientInfo !== false ? 'bg-[#25D366]' : 'bg-gray-200 dark:bg-[#333]'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white dark:bg-[#1a1a1a] w-6 h-6 rounded-full transition-transform ${formData.showClientInfo !== false ? 'transform translate-x-6' : ''}`}></div>
              </label>
            </div>
          </div>

          {/* Visibilidade do Projeto: Público vs Não listado */}
          <div className="space-y-3 md:col-span-2 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#262626] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-[13px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe size={15} className="text-[#3B82F6]" />
                  {lang === 'pt' ? 'Visibilidade do Projeto' : 'Project Visibility'}
                </h4>
                <p className="text-[12px] text-gray-500 dark:text-[#888] leading-tight mt-0.5 max-w-md">
                  {lang === 'pt'
                    ? 'Projetos "Não listados" não aparecem na página principal nem no portfólio público, ficando acessíveis exclusivamente por link direto.'
                    : 'Unlisted projects do not appear on the homepage or public portfolio, remaining accessible exclusively via direct link.'}
                </p>
              </div>

              <div className="flex items-center bg-gray-200/80 dark:bg-[#202020] p-1 rounded-xl border border-gray-300 dark:border-[#333] flex-shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    formData.visibility !== 'unlisted'
                      ? 'bg-white dark:bg-[#111] text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                      : 'text-gray-600 dark:text-[#888] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Globe size={13} />
                  <span>{lang === 'pt' ? 'Público' : 'Public'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, visibility: 'unlisted' }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    formData.visibility === 'unlisted'
                      ? 'bg-white dark:bg-[#111] text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/20'
                      : 'text-gray-600 dark:text-[#888] hover:text-black dark:hover:text-white'
                  }`}
                >
                  <EyeOff size={13} />
                  <span>{lang === 'pt' ? 'Não listado' : 'Unlisted'}</span>
                </button>
              </div>
            </div>
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
                className="bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                {uploading === 'thumbnail' ? <><Loader size={16} className="animate-spin" /> {Math.round(uploadProgress)}%</> : <><Upload size={16} /> {t[lang].upload || 'Upload'}</>}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Video size={14} />
                Video URL (YouTube/Vimeo)
              </span>
              {formData.category === 'Fotos' && (
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium normal-case tracking-normal">(opcional para fotos)</span>
              )}
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
                className="bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white px-5 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
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
                        {formData.category === 'Fotos' ? 'Galeria de Fotos do Projeto' : 'Fotos do Projeto / Imóvel (Galeria)'}
                      </h4>
                      <p className="text-gray-500 dark:text-[#777] text-[13px]">
                        {formData.category === 'Fotos'
                          ? 'As fotos cadastradas serão exibidas na galeria cinematográfica com suporte a slideshow e visualização em alta resolução.'
                          : 'As fotos cadastradas aparecerão em uma galeria logo abaixo do vídeo na página do imóvel.'}
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
                  {(() => {
                    const parsed = formData.downloadUrl ? parseDownloadUrl(formData.downloadUrl) : null;
                    const isFirebase = parsed?.type === 'firebase';
                    const isUploading = uploading === 'downloadUrl';
                    const isExternal = parsed && parsed.type !== 'firebase';

                    return (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] font-bold text-gray-700 dark:text-[#aaa] uppercase tracking-wider flex items-center gap-2">
                          <Cloud size={15} className="text-emerald-500" />
                          Arquivo para Download (Alta Resolução)
                        </label>
                        {isFirebase && (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={11} /> Firebase Storage Ativo
                          </span>
                        )}
                      </div>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="video/*,.zip,.rar"
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, 'downloadUrl')} 
                      />

                      {/* 1. ESTADO: ENVIANDO ARQUIVO */}
                      {isUploading && (
                        <div className="p-4 rounded-2xl border border-blue-500/40 bg-blue-50/60 dark:bg-blue-950/30 space-y-2.5">
                          <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                            <span className="flex items-center gap-2">
                              <Loader size={15} className="animate-spin text-blue-500" />
                              Enviando arquivo original para o Firebase Storage...
                            </span>
                            <span className="font-mono text-sm">{Math.round(uploadProgress)}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300 rounded-full" 
                              style={{ width: `${uploadProgress}%` }} 
                            />
                          </div>
                          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80">
                            O arquivo está sendo salvo diretamente na nuvem com metadados para download instantâneo no celular e PC.
                          </p>
                        </div>
                      )}

                      {/* 2. ESTADO: ARQUIVO FIREBASE JÁ CADASTRADO */}
                      {!isUploading && isFirebase && (
                        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                              <FileVideo size={22} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 size={13} className="text-emerald-500" />
                                <span>Arquivo Hospedado no Firebase</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-neutral-300 truncate max-w-md font-mono mt-0.5">
                                {parsed?.fileName || 'producao-original.mp4'}
                              </p>
                              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                                Download direto e automático liberado para clientes no celular e PC.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                            >
                              Substituir
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, downloadUrl: '' }))}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                              title="Remover arquivo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. ESTADO: SEM ARQUIVO DO FIREBASE (DROPZONE DE UPLOAD PRINCIPAL) */}
                      {!isUploading && !isFirebase && (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50/70 dark:bg-neutral-900/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-all group shadow-xs"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 group-hover:bg-emerald-500/10 text-gray-500 dark:text-neutral-400 group-hover:text-emerald-500 flex items-center justify-center mb-2.5 transition-colors">
                            <Upload size={22} />
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                            Enviar arquivo original para o Firebase
                          </p>
                          <p className="text-xs text-gray-500 dark:text-neutral-400 max-w-sm mb-3">
                            Clique aqui para fazer upload do vídeo em alta resolução (.MP4, .MOV, .ZIP). O download será 100% direto sem intermediários.
                          </p>
                          <span className="px-4 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold shadow-xs group-hover:scale-105 transition-transform flex items-center gap-1.5">
                            <Cloud size={14} /> Selecionar Arquivo
                          </span>
                        </div>
                      )}

                      {/* 4. SELEÇÃO SECUNDÁRIA: LINK EXTERNO (GOOGLE DRIVE / DROPBOX) */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowExternalLink(!showExternalLink)}
                          className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <HardDrive size={13} />
                          <span>{showExternalLink || isExternal ? 'Ocultar opção de link externo' : 'Ou prefere vincular link externo do Google Drive / Dropbox?'}</span>
                        </button>

                        {(showExternalLink || isExternal) && (
                          <div className="mt-2.5 p-3.5 bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-[#222] rounded-xl space-y-2 animate-in fade-in duration-200">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-wider block">
                              Link Externo (Google Drive / Dropbox)
                            </label>
                            <div className="flex gap-2">
                              <input 
                                type="url" 
                                name="downloadUrl"
                                value={formData.downloadUrl || ''} 
                                onChange={handleChange}
                                className="flex-1 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="https://drive.google.com/file/d/... ou https://www.dropbox.com/..."
                              />
                              {formData.downloadUrl && (
                                <button
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, downloadUrl: '' }))}
                                  className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
                                >
                                  Limpar
                                </button>
                              )}
                            </div>
                            {isExternal && (() => {
                              if (parsed?.type === 'google-drive-file') {
                                return (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                                    <CheckCircle2 size={13} />
                                    Link do Google Drive detectado (será baixado diretamente sem abrir view.htm).
                                  </div>
                                );
                              }
                              if (parsed?.type === 'google-drive-folder') {
                                return (
                                  <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium pt-0.5">
                                    <CheckCircle2 size={13} />
                                    Pasta do Google Drive detectada (o cliente será direcionado à pasta para baixar os arquivos).
                                  </div>
                                );
                              }
                              if (parsed?.type === 'dropbox') {
                                return (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
                                    <CheckCircle2 size={13} />
                                    Link do Dropbox detectado (configurado para download direto automático).
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              
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

          {/* ---------------- FINANCEIRO DO PROJETO ---------------- */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-4 md:col-span-2 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <DollarSign size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Financeiro do Projeto</h4>
                  <p className="text-xs text-gray-500 dark:text-[#888]">Monitore o valor cobrado e o ganho obtido com esta produção</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700/50 w-fit">
                Coleção Financeiro
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-700 dark:text-[#bbb] uppercase tracking-wider flex items-center justify-between">
                  <span>Valor Cobrado / Ganho (R$)</span>
                  {formData.category === 'Fotos' && (
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium normal-case tracking-normal">(opcional)</span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 dark:text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price !== undefined ? formData.price : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value === '' ? undefined : parseFloat(e.target.value) }))}
                    placeholder="Ex: 3500.00"
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-[#777]">Este valor cairá diretamente no seu menu de Financeiro.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-gray-700 dark:text-[#bbb] uppercase tracking-wider">
                  Status do Pagamento
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'pending')}
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="paid">✓ Já Recebido (Entrada no Caixa)</option>
                  <option value="pending">⏳ A Receber / Pendente</option>
                </select>
                <p className="text-[11px] text-gray-500 dark:text-[#777]">Defina se o valor já foi pago pelo cliente ou se está pendente.</p>
              </div>
            </div>
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
                className="bg-gray-100 hover:bg-gray-200 dark:bg-[#222] dark:hover:bg-[#333] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white px-6 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 bg-gray-100 dark:bg-[#222] border border-gray-300 dark:border-[#333] text-[12px] font-semibold text-gray-900 dark:text-white px-3 py-1.5 rounded-full">
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
