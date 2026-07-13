import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Project, Evaluation } from "../types";
import { getProjects, getEvaluations } from "../utils/storage";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Download, Film, Star, Play, Pause, Calendar, Award, Compass, X } from "lucide-react";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [nextProject, setNextProject] = useState<Project | null>(null);

  useEffect(() => {
    const allProjects = getProjects();
    const foundProject = allProjects.find((p) => p.id === projectId);
    
    if (foundProject) {
      setProject(foundProject);
      setIsPlaying(false);
      
      // Find evaluation linked to this project
      const allEvals = getEvaluations();
      const linkedEval = allEvals.find((e) => e.projectId === foundProject.id);
      setEvaluation(linkedEval || null);

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
    }

    // Reset audio player when project changes
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudio(false);
      audioPlayerRef.current = null;
    }
  }, [projectId]);

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

  return (
    <div className="bg-[#FAF9F6] min-h-screen text-neutral-900 pb-24">
      {/* Background Cinematic Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-neutral-950/[0.02] to-transparent pointer-events-none z-0" />

      <div className={`max-w-7xl mx-auto px-6 pt-32 relative ${isPlaying ? 'z-auto' : 'z-10'}`}>
        
        {/* Navigation Breadcrumb & Back Arrow */}
        <div className="mb-10 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
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
          <div className={`lg:col-span-8 space-y-6 relative ${isPlaying ? 'z-[100]' : 'z-0'}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`relative w-full ${isVertical ? 'max-w-md mx-auto aspect-[9/16]' : 'aspect-video'} bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/40 ${isPlaying ? 'z-[110] shadow-[0_0_100px_rgba(0,0,0,0.95)] scale-[1.02]' : 'z-0'} transition-all duration-300`}
            >
              {!isPlaying ? (
                <div 
                  className="absolute inset-0 w-full h-full cursor-pointer group overflow-hidden"
                  onClick={() => setIsPlaying(true)}
                >
                  <img
                    src={project.thumbnail}
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
              ) : isEmbed ? (
                <iframe
                  key={project.videoUrl}
                  src={getEmbedUrl(project.videoUrl)}
                  title={project.title}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={project.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>

            {/* Cinema/Focus Mode Page-Darkening Backdrop Overlay (placed here as a sibling of the video container to guarantee stacking order) */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-[100] bg-neutral-950/85 backdrop-blur-sm pointer-events-auto cursor-pointer flex items-end justify-center pb-8 md:pb-12"
                  onClick={() => setIsPlaying(false)}
                >
                  {/* Elegant Floating Close Button */}
                  <div className="absolute top-6 right-6 z-[120] pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPlaying(false);
                      }}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer shadow-lg border border-white/15"
                      title="Sair do foco (Esc)"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Prompt helper at bottom */}
                  <span className="text-white/40 text-xs font-mono tracking-widest uppercase hidden sm:inline-block pointer-events-none select-none">
                    Clique fora ou pressione Esc para sair do foco
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Drive / Download Buttons under video */}
            {project.downloadUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-2xl border border-neutral-200/50 shadow-sm"
              >
                <div>
                  <h4 className="font-bold text-neutral-800 text-sm">Arquivo em Alta Resolução</h4>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">Clique no botão ao lado para acessar a pasta do Google Drive e baixar.</p>
                </div>
                <a
                  href={project.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-neutral-900 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  Download
                </a>
              </motion.div>
            )}
          </div>

          {/* Right Column: Bio + Client Review (Lg: col-span-4) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Video Biography / Description Card */}
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
                    {evaluation.photoUrl ? (
                      <img
                        src={evaluation.photoUrl}
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
    </div>
  );
}
