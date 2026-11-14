import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { Project, Evaluation, Client } from "../types";
import { getProjects, getEvaluations, updateProject, addNotification, getClients, fetchProjectById } from "../utils/storage";
import { getGalleryFromIndexedDB } from "../utils/imageStorage";
import { motion, AnimatePresence } from "motion/react";
import CustomVideoPlayer from "../components/CustomVideoPlayer";
import GlareHover from "../components/GlareHover";
import { ArrowLeft, Download, Lock, Unlock, CheckCircle2, Film, Star, Play, Pause, Calendar, Award, Compass, X, ChevronLeft, ChevronRight, HelpCircle, User, Phone, Instagram, MessageCircle, Mail, Image as ImageIcon, Maximize2, Share2, Check, Link2 } from "lucide-react";
import { triggerDownload } from "../utils/downloadHelper";

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn("navigator.clipboard failed, using fallback:", e);
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand("copy");
    textArea.remove();
    return success;
  } catch {
    return false;
  }
};

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadCodeInput, setDownloadCodeInput] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null);
  const [isDownloadCompleted, setIsDownloadCompleted] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDirectUnlocked, setIsDirectUnlocked] = useState(false);
  const [unlockAnimationPhase, setUnlockAnimationPhase] = useState<'idle' | 'unlatch' | 'slide' | 'unlocked'>('idle');
  const unlockTimersRef = useRef<NodeJS.Timeout[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [nextProject, setNextProject] = useState<Project | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showSlideShareTooltip, setShowSlideShareTooltip] = useState(false);
  const [slideCopiedShareLink, setSlideCopiedShareLink] = useState(false);

  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  };

  const handleShareWhatsApp = () => {
    const url = getShareUrl();
    const title = project?.title || 'Projeto';
    const message = `Confira o projeto "${title}":\n${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setShowShareTooltip(false);
  };

  const handleCopyShareLink = async () => {
    const url = getShareUrl();
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedShareLink(true);
      setTimeout(() => {
        setCopiedShareLink(false);
        setShowShareTooltip(false);
      }, 1800);
    }
  };

  const handleSlideCopyShareLink = async () => {
    const url = getShareUrl();
    const ok = await copyToClipboard(url);
    if (ok) {
      setSlideCopiedShareLink(true);
      setTimeout(() => {
        setSlideCopiedShareLink(false);
        setShowSlideShareTooltip(false);
      }, 1800);
    }
  };

  // Estados e controle dos 6 quadrinhos separados do código de acesso
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Foco automático e limpeza ao abrir o modal
  useEffect(() => {
    if (showDownloadModal) {
      setCodeDigits(['', '', '', '', '', '']);
      setDownloadError('');
      const timer = setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [showDownloadModal]);

  const handleDigitChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z0-9]$/.test(char)) return;

    const newDigits = [...codeDigits];
    newDigits[index] = char;
    setCodeDigits(newDigits);
    setDownloadError('');

    if (char && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (codeDigits[index]) {
        const newDigits = [...codeDigits];
        newDigits[index] = '';
        setCodeDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...codeDigits];
        newDigits[index - 1] = '';
        setCodeDigits(newDigits);
        digitInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleUnlockWithCode();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!pasted) return;

    const newDigits = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setCodeDigits(newDigits);
    setDownloadError('');

    const targetIdx = Math.min(pasted.length, 5);
    digitInputRefs.current[targetIdx]?.focus();
  };

  useEffect(() => {
    return () => {
      unlockTimersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const handleUnlockWithCode = () => {
    if (!project) return;
    const enteredCode = codeDigits.join('').trim().toUpperCase();
    const expectedCode = (project.downloadCode || '').trim().toUpperCase();

    if (enteredCode.length < 6) {
      setDownloadError('Digite os 6 caracteres do código.');
      return;
    }

    if (expectedCode && enteredCode === expectedCode) {
      // Limpa timers anteriores
      unlockTimersRef.current.forEach((t) => clearTimeout(t));
      unlockTimersRef.current = [];

      // 1. Fecha o modal na hora
      setShowDownloadModal(false);
      setDownloadError('');

      // 2. Inicia a animação imediatamente após o modal fechar:
      // Fase 1: Destranca o cadeado na direita com animação de pop
      setUnlockAnimationPhase('unlatch');

      // Fase 2 (após 450ms): A forma desliza para a esquerda e o botão muda para verde
      const t1 = setTimeout(() => {
        setUnlockAnimationPhase('slide');
      }, 450);

      // Fase 3 (após 1250ms): Conclui a animação, atualiza a URL e estabelece o download liberado
      const t2 = setTimeout(() => {
        setUnlockAnimationPhase('unlocked');
        setIsDirectUnlocked(true);
        setSearchParams({ unlock: enteredCode }, { replace: true });
      }, 1250);

      unlockTimersRef.current = [t1, t2];
    } else {
      setDownloadError('Código de acesso incorreto. Tente novamente.');
    }
  };

  // Efeito de detecção de desbloqueio via Link Único do Cliente (?unlock=CODE ou ?token=CODE)
  // O botão de download liberado aparece ESTRITAMENTE quando a URL atual contém o código correto.
  useEffect(() => {
    if (!project) {
      setIsDirectUnlocked(false);
      return;
    }

    // Se a animação de liberação estiver em andamento, não interrompe
    if (unlockAnimationPhase !== 'idle' && unlockAnimationPhase !== 'unlocked') {
      return;
    }

    // Limpa quaisquer resquícios de armazenamento para garantir que não persista na navegação comum
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(`unlocked_${project.id}`);
      } catch {}
    }

    const urlUnlockParam = (searchParams.get('unlock') || searchParams.get('token') || searchParams.get('code') || '').trim().toUpperCase();

    if (urlUnlockParam && project.downloadCode && urlUnlockParam === project.downloadCode.trim().toUpperCase()) {
      setIsDirectUnlocked(true);
    } else {
      if (unlockAnimationPhase === 'idle') {
        setIsDirectUnlocked(false);
      }
    }
  }, [project, searchParams, unlockAnimationPhase]);

  // Estados visuais calculados para animação do botão de download
  const isFinalUnlocked = isDirectUnlocked || unlockAnimationPhase === 'unlocked';
  const isShapeOnLeft = isFinalUnlocked || unlockAnimationPhase === 'slide';
  const isGreenBg = isFinalUnlocked || unlockAnimationPhase === 'slide';
  const isUnlatched = isFinalUnlocked || unlockAnimationPhase === 'unlatch' || unlockAnimationPhase === 'slide';
  const isUnlockedText = isFinalUnlocked || unlockAnimationPhase === 'slide';
  // Download totalmente liberado em estado contínuo (sweep RTL e pulso/destrancar do cadeado a cada 3s)
  const isContinuousUnlocked = isFinalUnlocked && (unlockAnimationPhase === 'unlocked' || unlockAnimationPhase === 'idle');

  // Cinematic photo gallery states
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const applyFoundProject = (foundProject: Project) => {
      setProject(foundProject);
      setIsLoading(false);
      if (foundProject.title) {
        document.title = `${foundProject.title} | Daniel Vale`;
      }
      if (foundProject.thumbnail) {
        let ogImg = document.querySelector('meta[property="og:image"]');
        if (!ogImg) {
          ogImg = document.createElement('meta');
          ogImg.setAttribute('property', 'og:image');
          document.head.appendChild(ogImg);
        }
        ogImg.setAttribute('content', foundProject.thumbnail);
      }

      // Busca fotos salvas em IndexedDB caso existam mais imagens locais
      getGalleryFromIndexedDB(foundProject.id).then((cached) => {
        if (!isCancelled && cached && cached.length > 0) {
          setProject(prev => {
            if (prev && prev.id === foundProject.id) {
              const existing = prev.images || [];
              const merged = Array.from(new Set([...existing, ...cached]));
              return { ...prev, images: merged };
            }
            return prev;
          });
        }
      });

      // Find evaluation linked to this project
      const allEvals = getEvaluations();
      const linkedEval = allEvals.find((e) => e.projectId === foundProject.id);
      setEvaluation(linkedEval || null);

      // Find client linked to this project if enabled
      const allClients = getClients();
      let linkedClient: Client | null = null;
      
      // Verifica se as informações do cliente estão ativadas para este projeto
      const isClientInfoEnabled = foundProject.showClientInfo !== false && Boolean(foundProject.clientId);
      
      if (isClientInfoEnabled && foundProject.clientId) {
        linkedClient = allClients.find((c) => c.id === foundProject.clientId) || null;
      }
      setClient(linkedClient);

      // Find next project in the list for continuous reading/watching (apenas projetos públicos)
      const allProjects = getProjects();
      const publicProjects = allProjects.filter((p) => p.visibility !== 'unlisted');
      const currentIndex = publicProjects.findIndex((p) => p.id === foundProject.id);
      if (currentIndex !== -1 && publicProjects.length > 1) {
        const nextIndex = (currentIndex + 1) % publicProjects.length;
        if (publicProjects[nextIndex] && publicProjects[nextIndex].id !== foundProject.id) {
          setNextProject(publicProjects[nextIndex]);
        } else {
          setNextProject(null);
        }
      } else if (publicProjects.length > 0 && foundProject.visibility === 'unlisted') {
        setNextProject(publicProjects[0]);
      } else {
        setNextProject(null);
      }
    };

    const loadProjectAndClient = async () => {
      if (!projectId) {
        setIsLoading(false);
        setProject(null);
        return;
      }

      const cleanId = decodeURIComponent(projectId).trim();

      const matchProject = (p: Project) => {
        if (!p) return false;
        if (p.id === cleanId || p.id.toLowerCase() === cleanId.toLowerCase()) return true;
        if (p.title) {
          const title = p.title.trim().toLowerCase();
          if (title === cleanId.toLowerCase()) return true;
        }
        return false;
      };

      // 1. Tenta carregar do cache local imediatamente (0ms)
      const allProjects = getProjects();
      const localFound = allProjects.find(matchProject);
      if (localFound) {
        applyFoundProject(localFound);
        return;
      }

      // 2. Não encontrado localmente (primeiro acesso via link do WhatsApp no celular):
      // Mantém estado de carregamento REC e faz busca direta ultra rápida no Firestore (REST + SDK)
      setIsLoading(true);
      try {
        const remoteFound = await fetchProjectById(cleanId);
        if (isCancelled) return;
        if (remoteFound) {
          applyFoundProject(remoteFound);
          return;
        }
      } catch (err) {
        console.warn("Notice checking remote project:", err);
      }

      // 3. Fallback: aguarda sincronização em segundo plano antes de concluir que não existe
      const timer = setTimeout(() => {
        if (!isCancelled) {
          const recheck = getProjects().find(matchProject);
          if (recheck) {
            applyFoundProject(recheck);
          } else {
            setIsLoading(false);
            setProject(null);
            setClient(null);
          }
        }
      }, 5000);

      return () => clearTimeout(timer);
    };

    loadProjectAndClient();
    setIsPlaying(false);
    setActivePhotoIndex(0);
    setIsSlideshowActive(false);
    setSlideshowProgress(0);

    // Reset audio player when project changes
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudio(false);
      audioPlayerRef.current = null;
    }

    const handleProjectsUpdated = () => {
      if (projectId) {
        const cleanId = decodeURIComponent(projectId).trim();
        const p = getProjects().find(proj => (
          proj.id === cleanId ||
          proj.id.toLowerCase() === cleanId.toLowerCase() ||
          proj.title?.trim().toLowerCase() === cleanId.toLowerCase()
        ));
        if (p) {
          applyFoundProject(p);
        }
      }
    };

    window.addEventListener("clients-updated", handleProjectsUpdated);
    window.addEventListener("projects-updated", handleProjectsUpdated);
    return () => {
      isCancelled = true;
      window.removeEventListener("clients-updated", handleProjectsUpdated);
      window.removeEventListener("projects-updated", handleProjectsUpdated);
    };
  }, [projectId]);

  // Gallery keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeList = (project?.images && project.images.length > 0) ? project.images : [project?.thumbnail || ''];
      if (selectedGalleryIndex !== null && activeList.length > 0) {
        if (e.key === "Escape") {
          setSelectedGalleryIndex(null);
        } else if (e.key === "ArrowRight") {
          setSelectedGalleryIndex((prev) => (prev !== null ? (prev + 1) % activeList.length : 0));
        } else if (e.key === "ArrowLeft") {
          setSelectedGalleryIndex((prev) => (prev !== null ? (prev - 1 + activeList.length) % activeList.length : 0));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGalleryIndex, project?.images, project?.thumbnail]);

  useEffect(() => {
    if (project) {
      const incrementView = () => {
        const list = getProjects();
        const p = list.find(x => x.id === project.id);
        if (p) {
          updateProject(project.id, { views: (p.views || 0) + 1 });
        }
      };

      // Use a timeout to avoid strict mode double counting and ensure it's a real view
      const timer = setTimeout(() => {
        incrementView();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [project?.id]);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      document.body.classList.add("video-playing");
    } else {
      document.body.classList.remove("video-playing");
    }
    return () => {
      document.body.classList.remove("video-playing");
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPlaying(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const validImages = (project?.images || []).filter((img): img is string => 
    typeof img === 'string' && 
    img.trim().length > 0 && 
    !img.startsWith('blob:') && 
    (img.startsWith('http') || img.startsWith('data:image/'))
  );

  const allGalleryPhotos = validImages.length > 0 
    ? validImages 
    : (project?.thumbnail && (project.thumbnail.startsWith('http') || project.thumbnail.startsWith('data:image/')) ? [project.thumbnail] : []);

  const isPhotoProject = Boolean(
    project?.isPhotoGallery || 
    (project?.category && project.category.toLowerCase().includes('foto')) || 
    (project?.category && project.category.toLowerCase().includes('ensaio')) ||
    (!project?.videoUrl && allGalleryPhotos.length > 0)
  );

  const currentPhoto = allGalleryPhotos[activePhotoIndex] || allGalleryPhotos[0] || project?.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800";

  // Slideshow autoplay effect
  useEffect(() => {
    let timer: any = null;
    let progressTimer: any = null;

    if (isSlideshowActive && isPhotoProject && allGalleryPhotos.length > 1) {
      const intervalTime = 4000; // 4 seconds
      const stepTime = 50; // update progress every 50ms
      let elapsed = 0;

      progressTimer = setInterval(() => {
        elapsed += stepTime;
        setSlideshowProgress(Math.min((elapsed / intervalTime) * 100, 100));
      }, stepTime);

      timer = setInterval(() => {
        setActivePhotoIndex((prev) => (prev + 1) % allGalleryPhotos.length);
        elapsed = 0;
        setSlideshowProgress(0);
      }, intervalTime);
    } else {
      setSlideshowProgress(0);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isSlideshowActive, isPhotoProject, allGalleryPhotos.length]);

  // Slideshow keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPhotoProject && allGalleryPhotos.length > 1) {
        if (e.key === "ArrowRight") {
          setActivePhotoIndex((prev) => (prev + 1) % allGalleryPhotos.length);
          setIsSlideshowActive(false);
        } else if (e.key === "ArrowLeft") {
          setActivePhotoIndex((prev) => (prev - 1 + allGalleryPhotos.length) % allGalleryPhotos.length);
          setIsSlideshowActive(false);
        } else if (e.key === " ") {
          e.preventDefault();
          setIsSlideshowActive((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPhotoProject, allGalleryPhotos.length]);

  const handleDirectDownload = async (url: string, customFilename?: string) => {
    if (!url) {
      alert("Os arquivos em alta resolução deste projeto estão sendo finalizados. Por favor, entre em contato via WhatsApp.");
      return;
    }
    setIsDownloading(true);
    setIsDownloadCompleted(false);
    setDownloadPercent(0);
    try {
      const cleanTitle = (project?.title || 'projeto').replace(/[/\\?%*:|"<>]/g, '_');
      const isZip = url.includes('.zip');
      const isImg = isPhotoProject || url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || url.includes('.webp');
      const ext = isZip ? 'zip' : (isImg ? 'jpg' : 'mp4');
      const finalFilename = customFilename || `${cleanTitle}.${ext}`;
      await triggerDownload(url, finalFilename, (percent) => {
        setDownloadPercent(percent);
      });
      // 100% atingido: transiciona para o botão branco de download concluído
      setDownloadPercent(100);
      setIsDownloadCompleted(true);
      // Mantém o estado branco concluído por 3.5 segundos para o usuário ver
      await new Promise(res => setTimeout(res, 3500));
    } catch (err) {
      console.warn("Aviso ao processar download:", err);
    } finally {
      setIsDownloading(false);
      setDownloadPercent(null);
      setIsDownloadCompleted(false);
      setShowDownloadModal(false);
      setDownloadCodeInput('');
    }
  };

  const handleAddComment = (text: string) => {
    if (!project) return;
    addNotification({
      projectId: project.id,
      projectName: project.title,
      message: `"${text}"`
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
        {/* Subtle top light leak/glow */}
        <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-neutral-950/[0.03] to-transparent pointer-events-none z-0" />

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex flex-col items-center justify-center -mt-8"
        >
          {/* Circular Text with REC logo in the center */}
          <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56">
            {/* Texto circular giratório */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <defs>
                  <path
                    id="loading-circle-path"
                    d="M 100, 100 m -72, 0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0"
                  />
                </defs>
                <text className="text-[9.5px] font-black tracking-[0.24em] uppercase fill-neutral-800">
                  <textPath href="#loading-circle-path" startOffset="0%">
                    • CARREGANDO PROJETO • CARREGANDO PROJETO 
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* Badge REC no centro com efeito de gravação pulsante */}
            <div className="relative z-10 flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-[0_12px_36px_rgba(0,0,0,0.08)] border border-neutral-200/80">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-3 h-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FB2C36]" />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#FB2C36] animate-ping opacity-75" />
                </div>
                <span className="font-urbanist font-black text-base sm:text-lg text-[#FB2C36] tracking-[0.2em] -mr-1 select-none">
                  REC
                </span>
              </div>
            </div>
          </div>

          {/* Subtítulo suave */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-6 flex flex-col items-center gap-1"
          >
            <span className="font-urbanist font-bold text-sm tracking-wide text-neutral-800">
              Carregando projeto...
            </span>
            <span className="text-[11px] font-medium text-neutral-400">
              Aguarde um instante
            </span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-6"
        >
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-800 mx-auto">
            <Compass size={32} />
          </div>
          <h1 className="text-3xl font-bold text-neutral-950 tracking-tight">Projeto não encontrado</h1>
          <p className="text-neutral-500 font-light leading-relaxed">
            O projeto que você está tentando acessar não existe ou foi removido.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black active:scale-[0.98] text-white text-sm font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300"
          >
            <ArrowLeft size={16} />
            Voltar para o Início
          </Link>
        </motion.div>
      </div>
    );
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('shorts/')) {
        videoId = url.split('shorts/')[1]?.split(/[?#]/)[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split(/[?#]/)[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split(/[?#]/)[0];
      }
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=${origin}`;
    }
    if (url.includes('drive.google.com')) {
      const fileId = url.split('/d/')[1]?.split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`;
    }
    if (url.includes('instagram.com')) {
      const postId = url.split('/p/')[1]?.split('/')[0];
      return `https://www.instagram.com/p/${postId}/embed/`;
    }
    return url;
  };

  const isYouTube = project.videoUrl.includes('youtube.com') || project.videoUrl.includes('youtu.be');
  const isDrive = project.videoUrl.includes('drive.google.com');
  const isInstagram = project.videoUrl.includes('instagram.com');
  const isEmbed = isYouTube || isDrive || isInstagram;
  const isVertical = project.videoUrl.includes('shorts/') || project.videoUrl.includes('instagram.com');

  const handlePlayPauseAudio = () => {
    if (!evaluation?.audioUrl) return;

    if (playingAudio) {
      audioPlayerRef.current?.pause();
      setPlayingAudio(false);
    } else {
      if (!audioPlayerRef.current) {
        const audio = new Audio(evaluation.audioUrl);
        audio.onended = () => setPlayingAudio(false);
        audioPlayerRef.current = audio;
      }
      audioPlayerRef.current.play()
        .then(() => setPlayingAudio(true))
        .catch((err) => console.error("Error playing evaluation audio", err));
    }
  };

  const cleanProjectTitle = (project.title || '').trim();
  const hasTitle = cleanProjectTitle.length > 0 && 
    cleanProjectTitle.toLowerCase() !== 'ensaio fotográfico' && 
    cleanProjectTitle.toLowerCase() !== 'novo projeto' && 
    cleanProjectTitle.toLowerCase() !== 'sem título';

  const isDescriptionVisible = project.showDescription !== false && Boolean(project.description?.trim());

  // Renderizadores auxiliares para manter layout limpo e consistente
  const renderClientCard = () => {
    if (!client || project.showClientInfo === false) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FDFDFD] rounded-3xl p-7 border border-neutral-200/70 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 flex-shrink-0 flex items-center justify-center shadow-inner">
            {client.logoUrl?.trim() ? (
              <img
                src={client.logoUrl.trim()}
                alt={client.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={30} className="text-neutral-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span 
              className="text-xs text-neutral-400 font-light block mb-0.5 tracking-wide"
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}
            >
              Fale com
            </span>
            <h4 className="font-bold text-neutral-900 text-base leading-tight truncate">
              {client.name}
            </h4>
            {client.company && (
              <p className="text-xs text-neutral-500 font-medium truncate mt-0.5">
                {client.company}
              </p>
            )}
          </div>
        </div>

        {/* Ações de Contato: WhatsApp, Instagram e Email */}
        <div className="space-y-2.5 pt-3 border-t border-neutral-100">
          {client.phone && (
            <a
              href={`https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vi o imóvel "${project.title}" no portfólio do Daniel Vale e gostaria de mais informações.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          )}

          {client.instagram && (
            <a
              href={client.instagram.startsWith('http') ? client.instagram : `https://instagram.com/${client.instagram.replace('@', '').trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 active:scale-[0.98] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Instagram size={16} />
              Instagram
            </a>
          )}

          {client.email && (
            <a
              href={`mailto:${client.email}?subject=${encodeURIComponent(`Interesse no imóvel: ${project.title}`)}`}
              className="w-full bg-neutral-100 hover:bg-neutral-200 active:scale-[0.98] text-neutral-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail size={14} className="text-neutral-500" />
              {client.email}
            </a>
          )}
        </div>
      </motion.div>
    );
  };

  const renderDescriptionCard = () => {
    if (!isDescriptionVisible) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#FDFDFD] rounded-3xl p-8 border border-neutral-200/60 shadow-sm"
      >
        <h3 className="text-lg font-bold tracking-tight text-neutral-900 mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-100 text-neutral-800">
            <Film size={14} />
          </span>
          Sobre a Produção
        </h3>

        <div className="prose prose-neutral max-w-none">
          <p className="text-neutral-600 text-sm font-light leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1">
            <Calendar size={13} className="text-neutral-500" />
            <span>Portfólio Oficial</span>
          </div>
          <div className="flex items-center gap-1">
            <Award size={13} className="text-neutral-500" />
            <span>Direção e Edição</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEvaluationCard = () => {
    if (!evaluation) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-[#FDFDFD] rounded-3xl p-8 border border-neutral-200/60 shadow-sm relative"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-900/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200/50 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-neutral-800 text-sm">
            {evaluation.photoUrl?.trim() ? (
              <img
                src={evaluation.photoUrl.trim()}
                alt={evaluation.clientName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-sm text-neutral-800">
                {evaluation.clientName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-neutral-800 text-sm leading-tight">{evaluation.clientName}</h4>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Cliente parceiro</p>
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < evaluation.stars ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"}
            />
          ))}
        </div>

        <p className="text-neutral-600 text-sm font-light italic leading-relaxed mb-6">
          "{evaluation.comment}"
        </p>

        {evaluation.audioUrl && (
          <div className="mt-5 p-3 bg-neutral-50 rounded-xl flex items-center gap-3.5 border border-neutral-200/40 overflow-visible">
            <div className="relative group/tooltip">
              <button
                type="button"
                onClick={handlePlayPauseAudio}
                className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-black active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all shadow-sm"
              >
                {playingAudio ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
              </button>

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-medium rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 shadow-md">
                Escute a mensagem de voz
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-neutral-800 block">Feedback por Áudio</span>
              <span className="text-[9px] text-neutral-400 block font-mono">Clique para reproduzir o depoimento</span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderDownloadButton = () => {
    if (project?.allowDownload === false) return null;
    return (
      <motion.button
        layout
        type="button"
        disabled={unlockAnimationPhase !== 'idle' && unlockAnimationPhase !== 'unlocked'}
        onClick={() => {
          if (unlockAnimationPhase !== 'idle' && unlockAnimationPhase !== 'unlocked') return;
          if (isFinalUnlocked || !project.downloadCode) {
            handleDirectDownload(project.downloadUrl || (isPhotoProject ? (allGalleryPhotos[0] || project.thumbnail) : project.videoUrl) || '');
          } else {
            setShowDownloadModal(true);
            setDownloadCodeInput('');
            setDownloadError('');
          }
        }}
        animate={{
          backgroundColor: isDownloadCompleted
            ? "#ffffff"
            : isGreenBg
            ? "#52C31A"
            : "#0d0d0d",
          borderColor: isDownloadCompleted
            ? "#4AC80B"
            : isGreenBg
            ? "#4AC80B"
            : "#262626",
        }}
        transition={{
          backgroundColor: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          borderColor: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          layout: { type: "spring", stiffness: 120, damping: 18, mass: 0.8 },
        }}
        className={`group relative flex-1 w-full h-[56px] rounded-2xl p-0 flex items-center overflow-hidden shadow-sm hover:shadow-md active:scale-[0.99] transition-shadow duration-200 cursor-pointer select-none border-[2px] ${
          isShapeOnLeft ? 'flex-row' : 'flex-row-reverse'
        }`}
        title="Download do Projeto"
      >
        {(isDownloading || isDownloadCompleted) ? (
          <>
            {/* Camada Base (Fundo Verde com Texto Branco) */}
            <div className="absolute inset-0 flex items-center select-none pointer-events-none z-0">
              <div className="relative h-full w-[56px] min-w-[56px] bg-white flex items-center justify-center flex-shrink-0">
                <div className="relative flex items-center justify-center w-10 h-10">
                  <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" stroke="#e6f7df" strokeWidth="2.5" fill="none" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      stroke="#52C31A"
                      strokeWidth="2.8"
                      fill="none"
                      strokeDasharray="87.96"
                      strokeDashoffset={87.96 - (87.96 * Math.min(100, Math.max(0, downloadPercent ?? 0))) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-150 ease-out"
                    />
                  </svg>
                  <span className="absolute font-urbanist font-black text-[10.5px] text-[#52C31A] tracking-tighter">
                    {downloadPercent ?? 0}%
                  </span>
                </div>
                <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[8px] border-y-transparent border-l-[8px] border-l-white z-20 pointer-events-none" />
              </div>

              <div className="flex-1 flex flex-col justify-center text-left pl-4 sm:pl-5 pr-3 text-white leading-tight font-urbanist select-none overflow-hidden">
                <span className="font-urbanist font-bold text-[14.5px] sm:text-[15.5px] tracking-tight text-white leading-tight truncate w-full">
                  Baixando Arquivo... {downloadPercent !== null ? `${downloadPercent}%` : ''}
                </span>
                <span className="font-urbanist font-light text-[10.5px] sm:text-[11.5px] text-white/95 mt-0.5 truncate w-full">
                  Aguarde a finalização do arquivo
                </span>
              </div>
            </div>

            {/* Camada Branca que vem enchendo até o final com Texto em Letra Verde */}
            <div
              className="absolute inset-0 bg-white z-10 pointer-events-none overflow-hidden transition-all duration-150 ease-out flex items-center select-none"
              style={{
                clipPath: `inset(0 ${100 - (isDownloadCompleted ? 100 : Math.min(100, Math.max(0, downloadPercent ?? 0)))}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - (isDownloadCompleted ? 100 : Math.min(100, Math.max(0, downloadPercent ?? 0)))}% 0 0)`,
              }}
            >
              <div className="relative h-full w-[56px] min-w-[56px] bg-white flex items-center justify-center flex-shrink-0">
                {isDownloadCompleted ? (
                  <motion.div
                    key="mob-check"
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: [0.3, 1.25, 1], opacity: 1 }}
                    transition={{ duration: 0.35, ease: "backOut" }}
                    className="flex items-center justify-center"
                  >
                    <Check size={23} className="text-[#52C31A]" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <div className="relative flex items-center justify-center w-10 h-10">
                    <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" stroke="#e6f7df" strokeWidth="2.5" fill="none" />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        stroke="#52C31A"
                        strokeWidth="2.8"
                        fill="none"
                        strokeDasharray="87.96"
                        strokeDashoffset={87.96 - (87.96 * Math.min(100, Math.max(0, downloadPercent ?? 0))) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-150 ease-out"
                      />
                    </svg>
                    <span className="absolute font-urbanist font-black text-[10.5px] text-[#52C31A] tracking-tighter">
                      {downloadPercent ?? 0}%
                    </span>
                  </div>
                )}
                <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[8px] border-y-transparent border-l-[8px] border-l-white z-20 pointer-events-none" />
              </div>

              <div className="flex-1 flex flex-col justify-center text-left pl-4 sm:pl-5 pr-3 leading-tight font-urbanist select-none overflow-hidden">
                <span className="font-urbanist font-bold text-[14.5px] sm:text-[15.5px] tracking-tight text-[#52C31A] leading-tight truncate w-full">
                  {isDownloadCompleted
                    ? 'Download Concluído!'
                    : `Baixando Arquivo... ${downloadPercent !== null ? `${downloadPercent}%` : ''}`}
                </span>
                <span className="font-urbanist font-medium text-[10.5px] sm:text-[11.5px] text-[#52C31A] mt-0.5 truncate w-full">
                  {isDownloadCompleted
                    ? 'Verifique em sua galeria'
                    : 'Aguarde a finalização do arquivo'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Caixa Branca com Ícone (Cadeado Fechado / Aberto) */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.8 }}
              className={`relative h-full w-[56px] min-w-[56px] bg-white flex items-center justify-center flex-shrink-0 z-10 ${
                isShapeOnLeft ? 'rounded-l-[14px]' : 'rounded-r-[14px]'
              }`}
            >
              <AnimatePresence mode="wait">
                {!isUnlatched ? (
                  <motion.div
                    key="locked"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, rotate: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Lock
                      size={21}
                      className="text-neutral-950 transition-transform duration-200 group-hover:scale-110"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="unlocked"
                    initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
                    animate={{ scale: [0.4, 1.3, 1], rotate: 0, opacity: 1 }}
                    exit={{ scale: 0, rotate: 20, opacity: 0 }}
                    transition={{ duration: 0.45, ease: "backOut" }}
                    className="relative flex items-center justify-center"
                  >
                    {isContinuousUnlocked && (
                      <div className="absolute w-7 h-7 rounded-full bg-[#52C31A]/35 pointer-events-none animate-lock-glow" />
                    )}

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#52C31A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-300 group-hover:scale-110 relative z-10"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <motion.path
                        d="M7 11V7a5 5 0 0 1 9.9-1"
                        initial={{ pathLength: 0.5 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Setinha Branca apontando para a direita/esquerda */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-[8px] border-y-transparent z-20 pointer-events-none ${
                  isShapeOnLeft
                    ? 'right-[-8px] border-l-[8px] border-l-white'
                    : 'left-[-8px] border-r-[8px] border-r-white'
                }`}
              />
            </motion.div>

            {/* Texto Descritivo no Botão */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.8 }}
              className={`flex-1 flex flex-col justify-center px-4 overflow-hidden select-none pointer-events-none z-10 ${
                isShapeOnLeft ? 'text-left pl-3 sm:pl-4' : 'text-left pr-2 pl-3 sm:pl-4'
              }`}
            >
              <AnimatePresence mode="wait">
                {isUnlockedText ? (
                  <motion.div
                    key="text-liberado"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col items-start text-left w-full overflow-hidden"
                  >
                    <span className="font-urbanist font-bold text-[14.5px] sm:text-[15.5px] tracking-tight text-white leading-tight truncate w-full">
                      Download Liberado
                    </span>
                    <span className="font-urbanist font-light text-[10.5px] sm:text-[11.5px] text-white/95 mt-0.5 truncate w-full">
                      Clique aqui para iniciar o download
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text-bloqueado"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.22 }}
                    className="flex flex-col items-center text-center justify-center w-full px-1 overflow-hidden"
                  >
                    <span className="font-urbanist font-bold text-[15px] sm:text-[16px] tracking-tight text-white leading-tight truncate w-full">
                      Solicitar Download
                    </span>
                    <span className="font-urbanist font-light text-[11px] sm:text-[11.5px] text-neutral-300 mt-0.5 truncate w-full">
                      Cole o código para liberar
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {isContinuousUnlocked && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-[25]">
                <div className="animate-light-sweep absolute inset-y-0 w-[140px] pointer-events-none" />
              </div>
            )}
          </>
        )}
      </motion.button>
    );
  };

  const renderShareButton = () => (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setShowShareTooltip((prev) => !prev)}
        className={`h-[56px] w-[56px] rounded-2xl border-0 bg-white hover:bg-neutral-50 active:scale-95 text-neutral-800 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] ${
          showShareTooltip ? 'shadow-md ring-2 ring-[#52C31A]/30' : ''
        }`}
        title="Compartilhar projeto"
      >
        <Share2 size={20} strokeWidth={2.2} className="text-neutral-800" />
      </button>

      {/* Tooltip com WhatsApp e Copiar Link */}
      <AnimatePresence>
        {showShareTooltip && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowShareTooltip(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 top-[calc(100%+12px)] z-50 w-52 bg-neutral-950/95 backdrop-blur-md text-white rounded-2xl p-1.5 shadow-2xl border border-neutral-800"
            >
              <div className="absolute right-5 -top-1.5 w-3 h-3 bg-neutral-950 border-l border-t border-neutral-800 rotate-45" />

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-100 hover:bg-white/10 active:bg-white/15 transition-colors text-left cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                  <MessageCircle size={14} />
                </div>
                <span>WhatsApp</span>
              </button>

              <div className="h-px bg-neutral-800/80 my-1 mx-2" />

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-100 hover:bg-white/10 active:bg-white/15 transition-colors text-left cursor-pointer group"
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  copiedShareLink ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-neutral-300 group-hover:scale-110'
                }`}>
                  {copiedShareLink ? <Check size={13} strokeWidth={2.5} /> : <Link2 size={13} />}
                </div>
                <span>{copiedShareLink ? 'Link copiado!' : 'Copiar link'}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-neutral-900 pb-24 relative">
      {/* Background Cinematic Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-neutral-950/[0.02] to-transparent pointer-events-none z-0" />

      {isPhotoProject ? (
        /* ==================== LAYOUT DE FOTOS (FULL-WIDTH 3 POR LINHA) ==================== */
        <div className="w-full max-w-[1800px] mx-auto px-3 sm:px-6 md:px-8 pt-28 md:pt-32 relative z-10">
          {/* Top Bar: Voltar e Ações (Download e Compartilhar) */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => {
                const hasInternalReferrer = document.referrer && document.referrer.includes(window.location.host);
                if (hasInternalReferrer && window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="group flex items-center gap-2.5 text-neutral-500 hover:text-black font-semibold text-sm transition-colors duration-300 relative z-20 cursor-pointer"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-neutral-200/60 shadow-sm group-hover:scale-105 group-hover:-translate-x-0.5 transition-all">
                <ArrowLeft size={16} />
              </span>
              Voltar
            </button>

            {/* Botões de Download e Compartilhar */}
            <div className="flex items-center gap-3 relative z-20">
              {project.allowDownload !== false && (
                <div className="w-[170px] sm:w-[240px]">
                  {renderDownloadButton()}
                </div>
              )}
              {renderShareButton()}
            </div>
          </div>

          {/* Hero Title Area (Aparece apenas quando houver título adicionado) */}
          {hasTitle && (
            <div className="mb-8 max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900"
              >
                {cleanProjectTitle}
              </motion.h1>
              <div className="h-1 w-20 bg-neutral-900 mt-6 rounded-full" />
            </div>
          )}

          {/* Mosaico de Fotos em Toda a Página (3 por linha) */}
          {allGalleryPhotos.length > 0 ? (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2.5">
              {allGalleryPhotos.map((imgUrl, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (idx % 3) * 0.06 }}
                  onClick={() => {
                    const targetIdx = validImages.indexOf(imgUrl);
                    setSelectedGalleryIndex(targetIdx !== -1 ? targetIdx : idx);
                  }}
                  className="relative group cursor-pointer overflow-hidden aspect-square bg-neutral-100"
                >
                  <GlareHover
                    glareColor="#ffffff"
                    glareOpacity={0.25}
                    glareAngle={-45}
                    glareSize={220}
                    transitionDuration={650}
                    className="w-full h-full"
                  >
                    <img
                      src={imgUrl}
                      alt={`${project.title || 'Foto'} - ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                      <span className="opacity-0 group-hover:opacity-100 transition-all p-3 rounded-full bg-white/90 text-neutral-900 shadow-lg transform scale-90 group-hover:scale-100">
                        <Maximize2 size={18} />
                      </span>
                    </div>
                  </GlareHover>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
              <ImageIcon className="mx-auto text-neutral-300 mb-3" size={40} />
              <p className="text-neutral-500 font-medium text-sm">Nenhuma foto adicionada a este ensaio.</p>
            </div>
          )}

          {/* Seção Inferior: Informações do Cliente, Sinopse e Avaliação (Aparecem apenas se preenchidas) */}
          {(Boolean(client && project.showClientInfo !== false) || isDescriptionVisible || Boolean(evaluation)) && (
            <div className="mt-16 max-w-4xl mx-auto space-y-8">
              {client && project.showClientInfo !== false && renderClientCard()}
              {isDescriptionVisible && renderDescriptionCard()}
              {evaluation && renderEvaluationCard()}
            </div>
          )}
        </div>
      ) : (
        /* ==================== LAYOUT DE VÍDEO (PADRÃO 2 COLUNAS) ==================== */
        <div className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
          {/* Navigation Breadcrumb & Back Arrow */}
          <div className={`${hasTitle ? 'mb-10' : 'mb-6'} flex items-center justify-between`}>
            <button
              onClick={() => {
                const hasInternalReferrer = document.referrer && document.referrer.includes(window.location.host);
                if (hasInternalReferrer && window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="group flex items-center gap-2.5 text-neutral-500 hover:text-black font-semibold text-sm transition-colors duration-300 relative z-20 cursor-pointer"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-neutral-200/60 shadow-sm group-hover:scale-105 group-hover:-translate-x-0.5 transition-all">
                <ArrowLeft size={16} />
              </span>
              Voltar
            </button>
          </div>

          {/* Hero Title Area (Apenas se tiver título) */}
          {hasTitle && (
            <div className="mb-10 max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900"
              >
                {cleanProjectTitle}
              </motion.h1>
              <div className="h-1 w-20 bg-neutral-900 mt-6 rounded-full" />
            </div>
          )}

          {/* Main Grid: Media + Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Media Container (Lg: col-span-8) */}
            <div className="lg:col-span-8 space-y-6 relative z-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full aspect-square md:aspect-video lg:aspect-square rounded-none overflow-hidden shadow-md z-10 transition-all duration-300 border-0"
              >
                {!showVideoModal ? (
                  <div
                    className="absolute inset-0 w-full h-full cursor-pointer group overflow-hidden"
                    onClick={() => setShowVideoModal(true)}
                  >
                    <img
                      src={project.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-100"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play
                        size={68}
                        className="fill-white text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] ml-1 transition-transform duration-300 group-hover:scale-115"
                      />
                    </div>
                  </div>
                ) : null}
              </motion.div>

              {/* Galeria de Fotos do Imóvel (se houver) */}
              {validImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mt-8 pt-8 border-t border-neutral-200/80"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-neutral-900 text-white shadow-sm">
                          <ImageIcon size={16} />
                        </span>
                        Galeria de Fotos do Imóvel
                      </h3>
                      <p className="text-xs text-neutral-500 font-light mt-1">
                        Clique em qualquer foto para ampliar em alta resolução
                      </p>
                    </div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white text-neutral-800 border border-neutral-200/80 shadow-xs">
                      {validImages.length} {validImages.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {validImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedGalleryIndex(idx)}
                        className="group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer bg-neutral-100 border border-neutral-200/70 shadow-xs hover:shadow-md transition-all duration-300"
                      >
                        <img
                          src={imgUrl}
                          alt={`${project.title} - Foto ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-all p-2.5 rounded-full bg-white/95 text-neutral-900 shadow-md transform scale-90 group-hover:scale-100">
                            <Maximize2 size={16} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {client && project.showClientInfo !== false && renderClientCard()}

              {/* Botões de Download e Compartilhar */}
              <div className="w-full flex items-center gap-3">
                {project.allowDownload !== false && renderDownloadButton()}
                {renderShareButton()}
              </div>

              {/* Sobre a Produção (Apenas se tiver descrição e estiver ativado) */}
              {isDescriptionVisible && renderDescriptionCard()}

              {/* Avaliação do Cliente */}
              {evaluation && renderEvaluationCard()}
            </div>
          </div>
        </div>
      )}

      {/* Suggestion / Footer Loop for projects */}
      {nextProject && (
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-16 border-t border-neutral-200/60">
          <div className="max-w-xl">
            <span className="text-neutral-400 text-xs font-mono uppercase tracking-[0.25em] font-bold">Próximo Projeto</span>
            <Link
              to={`/projeto/${nextProject.id}`}
              className="group block mt-4"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 group-hover:text-black transition-colors leading-tight tracking-tight flex items-center gap-3">
                {nextProject.title}
                <span className="text-neutral-800 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
              </h3>
              <p className="text-neutral-400 text-sm mt-2 font-light">Continue navegando e conhecendo nosso catálogo</p>
            </Link>
          </div>
        </div>
      )}






      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[150] bg-black flex items-center justify-center select-none"
            onContextMenu={(e) => e.preventDefault()}
          >
            {isEmbed ? (
              <div className="relative w-full h-full pt-16">
                <button onClick={() => setShowVideoModal(false)} className="absolute top-4 left-4 z-50 text-white hover:text-gray-300 p-2">
                  <X size={28} />
                </button>
                <iframe
                  key={project.videoUrl}
                  src={getEmbedUrl(project.videoUrl)}
                  title={project.title}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <CustomVideoPlayer
                src={project.videoUrl}
                title={project.title}
                poster={project.thumbnail}
                onClose={() => setShowVideoModal(false)}
                onComment={handleAddComment}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>


      {/* Download Code Modal */}
      <AnimatePresence>
        {showDownloadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowDownloadModal(false)}
                className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-2 mt-1">
                <h3 className="text-xl font-bold text-neutral-900">Código de Acesso</h3>
                <div className="group relative flex items-center justify-center">
                  <HelpCircle size={16} className="text-neutral-400 hover:text-neutral-600 cursor-help transition-colors" />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-neutral-900 text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl font-medium leading-relaxed">
                    Para ter acesso ao código, basta pedir em nosso WhatsApp ou verificar a sua caixa de entrada.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-neutral-500 mb-6">Este projeto é protegido. Insira o código de download para acessar os arquivos em alta resolução.</p>

              <div className="space-y-5">
                {/* 6 Quadrinhos Separados de Entrada */}
                <div>
                  <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-2">
                    {codeDigits.map((digit, idx) => {
                      const enteredCode = codeDigits.join('').trim().toUpperCase();
                      const expectedCode = (project?.downloadCode || '').trim().toUpperCase();
                      const isCodeComplete = codeDigits.every((d) => d.trim() !== '') && enteredCode.length === 6;
                      const isCodeValid = isCodeComplete && expectedCode !== '' && enteredCode === expectedCode;
                      const isCodeInvalid = isCodeComplete && (!expectedCode || enteredCode !== expectedCode);

                      return (
                        <input
                          key={idx}
                          ref={(el) => (digitInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                          onPaste={handleDigitPaste}
                          className={`w-11 h-14 sm:w-12 sm:h-15 text-xl sm:text-2xl font-mono font-black text-center uppercase rounded-2xl border-2 transition-all duration-200 outline-none select-none ${isCodeValid
                              ? 'border-[#52C31A] bg-emerald-50/40 text-emerald-700 shadow-sm'
                              : isCodeInvalid
                                ? 'border-red-500 bg-red-50/40 text-red-600 shadow-sm'
                                : digit
                                  ? 'border-neutral-900 bg-neutral-50 text-neutral-900'
                                  : 'border-neutral-200 bg-neutral-50/60 text-neutral-900 hover:border-neutral-300 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-900/10'
                            }`}
                        />
                      );
                    })}
                  </div>

                  {(() => {
                    const enteredCode = codeDigits.join('').trim().toUpperCase();
                    const expectedCode = (project?.downloadCode || '').trim().toUpperCase();
                    const isCodeComplete = codeDigits.every((d) => d.trim() !== '') && enteredCode.length === 6;
                    const isCodeInvalid = isCodeComplete && (!expectedCode || enteredCode !== expectedCode);

                    if (isCodeInvalid) {
                      return (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-xs font-semibold mt-2.5 text-center"
                        >
                          Código de acesso incorreto. Tente novamente.
                        </motion.p>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Botão Liberar Download: não aparece se estiver incorreto, e fica clicável quando o código estiver correto */}
                {(() => {
                  const enteredCode = codeDigits.join('').trim().toUpperCase();
                  const expectedCode = (project?.downloadCode || '').trim().toUpperCase();
                  const isCodeComplete = codeDigits.every((d) => d.trim() !== '') && enteredCode.length === 6;
                  const isCodeValid = isCodeComplete && expectedCode !== '' && enteredCode === expectedCode;
                  const isCodeInvalid = isCodeComplete && (!expectedCode || enteredCode !== expectedCode);

                  if (isCodeInvalid) return null;

                  return (
                    <button
                      type="button"
                      onClick={isCodeValid ? handleUnlockWithCode : undefined}
                      disabled={!isCodeValid}
                      className={`w-full font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 select-none ${isCodeValid
                          ? 'bg-neutral-950 hover:bg-black active:scale-[0.98] text-white cursor-pointer shadow-md border border-neutral-950'
                          : 'bg-white border border-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                      <Unlock size={16} className={isCodeValid ? 'text-white' : 'text-neutral-400'} />
                      Liberar Download
                    </button>
                  );
                })()}

                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-neutral-100 w-full" />
                  <span className="bg-white px-2.5 text-[11px] text-neutral-400 font-medium absolute">ou</span>
                </div>

                {/* Botão de Solicitar Código via WhatsApp do Daniel Vale */}
                <a
                  href={`https://wa.me/5532998288650?text=${encodeURIComponent(`Olá Daniel! Gostaria de solicitar o código de acesso para download dos arquivos do projeto "${project.title}".`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle size={18} />
                  Solicitar código
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal para Galeria de Fotos */}
      {(() => {
        const activeList = isPhotoProject ? allGalleryPhotos : validImages;
        if (selectedGalleryIndex === null || !activeList[selectedGalleryIndex]) return null;
        return (
          <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between text-white z-10 max-w-7xl mx-auto w-full">
              <div>
                <h4 className="font-bold text-sm md:text-base text-white">{hasTitle ? project.title : 'Galeria de Fotos'}</h4>
                <p className="text-xs text-neutral-400 font-mono">
                  Foto {selectedGalleryIndex + 1} de {activeList.length}
                </p>
              </div>
              {/* Ações dentro do Slide: Download, Compartilhar e Fechar */}
              <div className="flex items-center gap-2.5">
                {/* Botão de Download */}
                {project.allowDownload !== false && (
                  <button
                    type="button"
                    onClick={() => {
                      if (unlockAnimationPhase !== 'idle' && unlockAnimationPhase !== 'unlocked') return;
                      if (isFinalUnlocked || !project.downloadCode) {
                        const currentImg = activeList[selectedGalleryIndex];
                        const cleanTitle = (project.title || 'foto').replace(/[/\\?%*:|"<>]/g, '_');
                        handleDirectDownload(currentImg, `${cleanTitle}_foto_${selectedGalleryIndex + 1}.jpg`);
                      } else {
                        setShowDownloadModal(true);
                        setDownloadCodeInput('');
                        setDownloadError('');
                      }
                    }}
                    disabled={isDownloading}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    title="Baixar esta foto"
                  >
                    {isDownloading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                )}

                {/* Botão de Compartilhar dentro do Slide */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowSlideShareTooltip((prev) => !prev)}
                    className={`w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                      showSlideShareTooltip ? 'ring-2 ring-[#52C31A]' : ''
                    }`}
                    title="Compartilhar foto"
                  >
                    <Share2 size={18} />
                  </button>

                  {/* Tooltip com WhatsApp e Copiar Link */}
                  <AnimatePresence>
                    {showSlideShareTooltip && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowSlideShareTooltip(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 top-[calc(100%+10px)] z-50 w-52 bg-neutral-950/95 backdrop-blur-md text-white rounded-2xl p-1.5 shadow-2xl border border-neutral-800"
                        >
                          <div className="absolute right-3.5 -top-1.5 w-3 h-3 bg-neutral-950 border-l border-t border-neutral-800 rotate-45" />

                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => {
                              handleShareWhatsApp();
                              setShowSlideShareTooltip(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-100 hover:bg-white/10 active:bg-white/15 transition-colors text-left cursor-pointer group"
                          >
                            <div className="w-6 h-6 rounded-lg bg-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                              <MessageCircle size={14} />
                            </div>
                            <span>WhatsApp</span>
                          </button>

                          <div className="h-px bg-neutral-800/80 my-1 mx-2" />

                          {/* Copiar Link */}
                          <button
                            type="button"
                            onClick={handleSlideCopyShareLink}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-100 hover:bg-white/10 active:bg-white/15 transition-colors text-left cursor-pointer group"
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                              slideCopiedShareLink ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-neutral-300 group-hover:scale-110'
                            }`}>
                              {slideCopiedShareLink ? <Check size={13} strokeWidth={2.5} /> : <Link2 size={13} />}
                            </div>
                            <span>{slideCopiedShareLink ? 'Link copiado!' : 'Copiar link'}</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Botão Fechar */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGalleryIndex(null);
                    setShowSlideShareTooltip(false);
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  title="Fechar (ESC)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Imagem Central com navegação */}
            <div className="relative flex-1 flex items-center justify-center my-4 max-w-6xl mx-auto w-full">
              {activeList.length > 1 && (
                <button
                  onClick={() => setSelectedGalleryIndex((prev) => (prev !== null ? (prev - 1 + activeList.length) % activeList.length : 0))}
                  className="absolute left-2 md:-left-12 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="Foto anterior"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              <motion.img
                key={selectedGalleryIndex}
                src={activeList[selectedGalleryIndex]}
                alt={`${project.title || 'Foto'} - ${selectedGalleryIndex + 1}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="max-h-[75vh] max-w-full object-contain rounded-none shadow-2xl"
              />

              {activeList.length > 1 && (
                <button
                  onClick={() => setSelectedGalleryIndex((prev) => (prev !== null ? (prev + 1) % activeList.length : 0))}
                  className="absolute right-2 md:-right-12 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="Próxima foto"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Miniaturas no rodapé */}
            {activeList.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-4xl mx-auto py-2 px-4 no-scrollbar">
                {activeList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGalleryIndex(idx)}
                    className={`w-14 h-14 rounded-none overflow-hidden flex-shrink-0 transition-all border-2 cursor-pointer ${
                      selectedGalleryIndex === idx ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
