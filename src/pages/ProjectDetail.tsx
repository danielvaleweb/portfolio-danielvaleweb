import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Project, Evaluation, Client } from "../types";
import { getProjects, getEvaluations, updateProject, addNotification, getClients } from "../utils/storage";
import { getGalleryFromIndexedDB } from "../utils/imageStorage";
import { motion, AnimatePresence } from "motion/react";
import CustomVideoPlayer from "../components/CustomVideoPlayer";
import { ArrowLeft, Download, Lock, Film, Star, Play, Pause, Calendar, Award, Compass, X, ChevronLeft, ChevronRight, HelpCircle, User, Phone, Instagram, MessageCircle, Mail, Image as ImageIcon, Maximize2 } from "lucide-react";
import { triggerDownload } from "../utils/downloadHelper";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadCodeInput, setDownloadCodeInput] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [nextProject, setNextProject] = useState<Project | null>(null);

  // Cinematic photo gallery states
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowProgress, setSlideshowProgress] = useState(0);

  useEffect(() => {
    const loadProjectAndClient = () => {
      const allProjects = getProjects();
      const foundProject = allProjects.find((p) => p.id === projectId);

      if (foundProject) {
        setProject(foundProject);

        // Busca fotos salvas em IndexedDB caso existam mais imagens locais
        getGalleryFromIndexedDB(foundProject.id).then((cached) => {
          if (cached && cached.length > 0) {
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

        // Find client linked to this project
        const allClients = getClients();
        let linkedClient: Client | null = null;
        if (foundProject.clientId) {
          linkedClient = allClients.find((c) => c.id === foundProject.clientId) || null;
        }
        if (!linkedClient && linkedEval) {
          linkedClient = allClients.find((c) => c.name.toLowerCase() === linkedEval.clientName.toLowerCase()) || null;
        }
        if (!linkedClient && allClients.length > 0) {
          linkedClient = allClients.find(c => foundProject.title.toLowerCase().includes(c.name.toLowerCase())) || allClients[0];
        }
        setClient(linkedClient);

        // Find next project in the list for continuous reading/watching
        const currentIndex = allProjects.findIndex((p) => p.id === foundProject.id);
        const nextIndex = (currentIndex + 1) % allProjects.length;
        if (allProjects[nextIndex] && allProjects[nextIndex].id !== foundProject.id) {
          setNextProject(allProjects[nextIndex]);
        } else {
          setNextProject(null);
        }
      } else {
        setProject(null);
        setClient(null);
      }
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

    window.addEventListener("clients-updated", loadProjectAndClient);
    window.addEventListener("projects-updated", loadProjectAndClient);
    return () => {
      window.removeEventListener("clients-updated", loadProjectAndClient);
      window.removeEventListener("projects-updated", loadProjectAndClient);
    };
  }, [projectId]);

  // Gallery keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedGalleryIndex !== null && project?.images && project.images.length > 0) {
        if (e.key === "Escape") {
          setSelectedGalleryIndex(null);
        } else if (e.key === "ArrowRight") {
          setSelectedGalleryIndex((prev) => (prev !== null ? (prev + 1) % project.images!.length : 0));
        } else if (e.key === "ArrowLeft") {
          setSelectedGalleryIndex((prev) => (prev !== null ? (prev - 1 + project.images!.length) % project.images!.length : 0));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedGalleryIndex, project?.images]);

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

  // Slideshow autoplay effect
  useEffect(() => {
    let timer: any = null;
    let progressTimer: any = null;

    if (isSlideshowActive && project?.isPhotoGallery && project?.images?.length) {
      const intervalTime = 4000; // 4 seconds
      const stepTime = 50; // update progress every 50ms
      let elapsed = 0;

      progressTimer = setInterval(() => {
        elapsed += stepTime;
        setSlideshowProgress(Math.min((elapsed / intervalTime) * 100, 100));
      }, stepTime);

      timer = setInterval(() => {
        setActivePhotoIndex((prev) => (prev + 1) % (project.images?.length || 1));
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
  }, [isSlideshowActive, project?.isPhotoGallery, project?.images?.length]);

  // Slideshow keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (project?.isPhotoGallery && project?.images?.length) {
        if (e.key === "ArrowRight") {
          setActivePhotoIndex((prev) => (prev + 1) % (project.images?.length || 1));
          setIsSlideshowActive(false);
        } else if (e.key === "ArrowLeft") {
          setActivePhotoIndex((prev) => (prev - 1 + (project.images?.length || 1)) % (project.images?.length || 1));
          setIsSlideshowActive(false);
        } else if (e.key === " ") {
          e.preventDefault();
          setIsSlideshowActive((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, project?.isPhotoGallery, project?.images?.length]);



  const handleDirectDownload = async (url: string) => {
    if (!url) return;
    setIsDownloading(true);
    try {
      await triggerDownload(url);
      // Brief feedback delay for smooth UX
      await new Promise(res => setTimeout(res, 800));
    } catch (err) {
      console.warn("Aviso ao processar download:", err);
    } finally {
      setIsDownloading(false);
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

  const validImages = (project.images || []).filter((img): img is string => 
    typeof img === 'string' && 
    img.trim().length > 0 && 
    !img.startsWith('blob:') && 
    (img.startsWith('http') || img.startsWith('data:image/'))
  );

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

  if (project.isPhotoGallery) {
    const galleryImages = project.images || [project.thumbnail];
    const currentImage = galleryImages[activePhotoIndex];

    return (
      <div className="bg-[#050505] min-h-screen text-neutral-100 flex flex-col justify-between selection:bg-white/10 select-none pb-8 relative overflow-hidden">
        {/* Subtle top light leak/glow */}
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none z-0" />

        {/* 1. Header (Cinema Bar) */}
        <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <button
            onClick={() => {
              const hasInternalReferrer = document.referrer && document.referrer.includes(window.location.host);
              if (hasInternalReferrer && window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="group flex items-center gap-2.5 text-neutral-400 hover:text-white font-medium text-xs tracking-wider uppercase transition-colors duration-300"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 shadow-sm group-hover:scale-105 group-hover:-translate-x-0.5 transition-all">
              <ArrowLeft size={14} />
            </span>
            Voltar
          </button>

          <div className="text-center hidden md:block">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-500 block mb-1">
              GALERIA DE FOTOS
            </span>
            <h1 className="text-sm font-semibold tracking-wide text-neutral-200">
              {project.title}
            </h1>
          </div>

          <div className="font-mono text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
            {String(activePhotoIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
          </div>
        </header>

        {/* 2. Main Cinema Stage */}
        <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 md:px-12 my-2 md:my-4">
          <div className="relative w-full max-w-5xl aspect-video md:h-[60vh] md:aspect-auto flex items-center justify-center group/stage">
            {/* Nav Arrows */}
            <button
              onClick={() => {
                setActivePhotoIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                setIsSlideshowActive(false);
              }}
              className="absolute left-4 md:-left-8 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-neutral-950/70 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:scale-105 active:scale-95 transition-all opacity-100 md:opacity-0 md:group-hover/stage:opacity-100 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => {
                setActivePhotoIndex((prev) => (prev + 1) % galleryImages.length);
                setIsSlideshowActive(false);
              }}
              className="absolute right-4 md:-right-8 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-neutral-950/70 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:scale-105 active:scale-95 transition-all opacity-100 md:opacity-0 md:group-hover/stage:opacity-100 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            >
              <ChevronRight size={20} />
            </button>

            {/* Photo Viewport */}
            <div className="relative w-full h-full bg-[#0a0a0a] border border-neutral-900 rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activePhotoIndex}
                  src={currentImage || project.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"}
                  alt={`${project.title} - Foto ${activePhotoIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-contain max-h-[50vh] md:max-h-[60vh]"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {/* Dynamic Slideshow Progress Line */}
              {isSlideshowActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-neutral-900/50 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500"
                    style={{ width: `${slideshowProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* 3. Controls & Metadata */}
        <section className="relative z-10 w-full max-w-4xl mx-auto px-6 mt-4">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="md:hidden">
              <h1 className="text-lg font-bold text-neutral-200">{project.title}</h1>
            </div>

            {project.description && (
              <p className="text-neutral-400 font-light text-xs md:text-sm max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}

            <div className="w-full border-t border-neutral-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Tags inside detail view only */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {(project.tags || [project.category]).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-full shadow-inner"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Minimalist Slideshow Button */}
              <button
                onClick={() => setIsSlideshowActive((prev) => !prev)}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-md ${isSlideshowActive
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white scale-[1.02]"
                    : "bg-white hover:bg-neutral-200 text-neutral-950"
                  }`}
              >
                {isSlideshowActive ? (
                  <>
                    <Pause size={12} fill="currentColor" /> Pausar Slideshow
                  </>
                ) : (
                  <>
                    <Play size={12} fill="currentColor" /> Slideshow
                  </>
                )}
              </button>

              {/* Optional Download */}
              <div className="min-w-[120px]">
                {project.downloadUrl ? (
                  <button
                    onClick={() => {
                      if (project.downloadCode) {
                        setShowDownloadModal(true);
                        setDownloadCodeInput('');
                        setDownloadError('');
                      } else {
                        handleDirectDownload(project.downloadUrl);
                      }
                    }}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white text-xs font-semibold tracking-wide transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    <Download size={14} /> Baixar Fotos
                  </button>
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Filmstrip Timeline / Thumbnails */}
        <section className="relative z-10 w-full max-w-4xl mx-auto px-6 mt-6">
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-2 snap-x">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePhotoIndex(idx);
                    setIsSlideshowActive(false);
                  }}
                  className={`relative flex-shrink-0 w-20 md:w-24 aspect-video rounded-lg overflow-hidden border transition-all duration-300 snap-center ${idx === activePhotoIndex
                      ? "border-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : "border-neutral-800 hover:border-neutral-500 opacity-60 hover:opacity-100"
                    }`}
                >
                  <img src={img || project.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Continuous Navigation to Next Project */}
        {nextProject && (
          <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 mt-8 pt-4 border-t border-neutral-900/60 flex items-center justify-between text-xs text-neutral-500">
            <span>Próximo Projeto:</span>
            <Link
              to={`/projeto/${nextProject.id}`}
              className="text-neutral-300 hover:text-emerald-400 font-semibold transition-colors duration-300 flex items-center gap-1 group"
            >
              {nextProject.title} <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </footer>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-neutral-900 pb-24">
      {/* Background Cinematic Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-neutral-950/[0.02] to-transparent pointer-events-none z-0" />

      <div className={`max-w-7xl mx-auto px-6 pt-32 relative z-10`}>

        {/* Navigation Breadcrumb & Back Arrow */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => {
              const hasInternalReferrer = document.referrer && document.referrer.includes(window.location.host);
              if (hasInternalReferrer && window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="group flex items-center gap-2.5 text-neutral-500 hover:text-black font-semibold text-sm transition-colors duration-300 relative z-20"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white border border-neutral-200/60 shadow-sm group-hover:scale-105 group-hover:-translate-x-0.5 transition-all">
              <ArrowLeft size={16} />
            </span>
            Voltar
          </button>

          <span className="text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 flex items-center gap-1.5">
            <Film size={12} className="text-neutral-500" />
            {project.category}
          </span>
        </div>

        {/* Hero Title Area */}
        <div className="mb-12 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900"
          >
            {project.title}
          </motion.h1>
          <div className="h-1 w-20 bg-neutral-900 mt-6 rounded-full" />
        </div>

        {/* Main Grid: Video + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Video Container (Lg: col-span-8) */}
          <div className={`lg:col-span-8 space-y-6 relative z-0`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`relative w-full aspect-square md:aspect-video lg:aspect-square bg-black rounded-3xl overflow-hidden shadow-lg border border-neutral-200/40 z-10 transition-all duration-300`}
            >
              {!showVideoModal ? (
                <div
                  className="absolute inset-0 w-full h-full cursor-pointer group overflow-hidden"
                  onClick={() => setShowVideoModal(true)}
                >
                  <img
                    src={project.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay & Centered Play Button */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/90 text-neutral-950 shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                      <Play size={28} className="fill-neutral-950 ml-1 text-neutral-950" />
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>

            {/* Galeria de Fotos do Imóvel */}
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
                      className="group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer bg-neutral-100 border border-neutral-200/70 shadow-sm hover:shadow-md transition-all duration-300"
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
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column: Bio + Client Review (Lg: col-span-4) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Card do Corretor / Cliente Parceiro */}
            {client && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
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
            )}

            {/* Download Card (Abaixo do Card de Cliente) */}
            {(project.downloadUrl || project.allowDownload) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 }}
                className="relative rounded-3xl shadow-lg bg-[#111111] overflow-hidden border border-neutral-800/80"
              >
                {/* Accent na quina (Instagram colors) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] opacity-20 blur-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#f9ce34] via-[#ee2a7b] to-transparent opacity-40 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

                <div className="relative flex flex-col gap-5 justify-between items-start p-6 h-full w-full">
                  <div>
                    <h4 className="font-bold text-white text-sm">Arquivo em Alta Resolução</h4>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">Clique no botão abaixo para baixar os arquivos do projeto.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (project.downloadCode) {
                        setShowDownloadModal(true);
                        setDownloadCodeInput('');
                        setDownloadError('');
                      } else {
                        handleDirectDownload(project.downloadUrl);
                      }
                    }}
                    className="w-full bg-neutral-900 hover:bg-black active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-[0.1em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-neutral-800"
                  >
                    <Lock size={15} className="mr-1 text-neutral-400" />
                    Download
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
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
                  {project.description || "Esta produção reflete nosso compromisso de traduzir a arquitetura e estética de alto padrão em imagens em movimento de alta impacto emocional."}
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

            {/* Client Evaluation Card */}
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#FDFDFD] rounded-3xl p-8 border border-neutral-200/60 shadow-sm relative"
              >
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-900/5 rounded-full blur-2xl pointer-events-none" />

                {/* Client Profile Info at the top */}
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

                {/* Stars and rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < evaluation.stars ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"}
                    />
                  ))}
                </div>

                {/* Comment text */}
                <p className="text-neutral-600 text-sm font-light italic leading-relaxed mb-6">
                  "{evaluation.comment}"
                </p>

                {/* Audio comment Player if present */}
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

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-medium rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 shadow-md">
                        Escute a mensagem de voz
                        {/* Tooltip arrow */}
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
            )}

          </div>

        </div>

        {/* Suggestion / Footer Loop for projects */}
        {nextProject && (
          <div className="mt-24 pt-16 border-t border-neutral-200/60">
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

      </div>





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

              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-6">
                <Download size={20} className="text-neutral-800" />
              </div>

              <div className="flex items-center gap-2 mb-2">
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

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={downloadCodeInput}
                    onChange={(e) => {
                      setDownloadCodeInput(e.target.value.toUpperCase());
                      setDownloadError('');
                    }}
                    placeholder="DIGITE O CÓDIGO"
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-neutral-400 focus:bg-white transition-colors text-center font-mono font-bold tracking-widest uppercase"
                    autoFocus
                  />
                  {downloadError && (
                    <p className="text-red-500 text-xs font-semibold mt-2 text-center">{downloadError}</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (downloadCodeInput === project.downloadCode) {
                      if (!project.downloadUrl) {
                        setDownloadError('Link de download indisponível no momento.');
                        return;
                      }
                      handleDirectDownload(project.downloadUrl);
                    } else {
                      setDownloadError('Código de acesso incorreto. Tente novamente.');
                    }
                  }}
                  disabled={isDownloading}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Iniciando download...
                    </>
                  ) : (
                    'Iniciar Download'
                  )}
                </button>

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
      {selectedGalleryIndex !== null && validImages[selectedGalleryIndex] && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between text-white z-10 max-w-7xl mx-auto w-full">
            <div>
              <h4 className="font-bold text-sm md:text-base text-white">{project.title}</h4>
              <p className="text-xs text-neutral-400 font-mono">
                Foto {selectedGalleryIndex + 1} de {validImages.length}
              </p>
            </div>
            <button
              onClick={() => setSelectedGalleryIndex(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Fechar (ESC)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Imagem Central com navegação */}
          <div className="relative flex-1 flex items-center justify-center my-4 max-w-6xl mx-auto w-full">
            {validImages.length > 1 && (
              <button
                onClick={() => setSelectedGalleryIndex((prev) => (prev !== null ? (prev - 1 + validImages.length) % validImages.length : 0))}
                className="absolute left-2 md:-left-12 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Foto anterior"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <motion.img
              key={selectedGalleryIndex}
              src={validImages[selectedGalleryIndex]}
              alt={`${project.title} - Foto ${selectedGalleryIndex + 1}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {validImages.length > 1 && (
              <button
                onClick={() => setSelectedGalleryIndex((prev) => (prev !== null ? (prev + 1) % validImages.length : 0))}
                className="absolute right-2 md:-right-12 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Próxima foto"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Miniaturas no rodapé */}
          {validImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto max-w-4xl mx-auto py-2 px-4 no-scrollbar">
              {validImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGalleryIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all border-2 ${selectedGalleryIndex === idx ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
