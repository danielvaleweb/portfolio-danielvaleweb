import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Project } from "../types";
import { getProjects, addEvaluation } from "../utils/storage";
import { Star, Check, Video, User, MessageSquare, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const STAR_LABELS: Record<number, string> = {
  1: "Pode melhorar",
  2: "Regular",
  3: "Bom",
  4: "Muito bom",
  5: "Excelente",
};

export default function Evaluate() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [stars, setStars] = useState<number>(5);
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allProjects = getProjects();
    const foundProject = allProjects.find((p) => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
    } else {
      setError("Projeto não encontrado. Você ainda pode deixar uma avaliação geral!");
    }
  }, [projectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Por favor, insira seu nome e sobrenome.");
      return;
    }
    if (!comment.trim()) {
      alert("Por favor, deixe um comentário sobre o vídeo.");
      return;
    }

    // Save evaluation
    addEvaluation({
      projectId: project?.id || "general",
      projectName: project?.title || "Avaliação Geral",
      clientName: name.trim(),
      stars,
      comment: comment.trim(),
    });

    setIsSubmitted(true);
  };

  const activeStarCount = hoverStars !== null ? hoverStars : stars;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 font-sans">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-200/40 via-transparent to-transparent pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white border border-neutral-200/80 rounded-3xl p-7 sm:p-10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.06)] relative z-10">
        
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Brand Header */}
              <div className="text-center mb-8">
                <span className="inline-block text-neutral-400 text-[11px] font-mono uppercase tracking-[0.2em] mb-2 font-medium">
                  Daniel Vale · Videomaker
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-2">
                  Deixe sua Avaliação
                </h1>
                <p className="text-neutral-500 text-sm font-light max-w-sm mx-auto leading-relaxed">
                  Sua opinião é fundamental para evoluirmos e comemorarmos este projeto juntos.
                </p>
              </div>

              {/* Project Preview Badge */}
              {project && (
                <div className="mb-7 flex items-center gap-3.5 bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-3.5">
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0 relative border border-neutral-200/60 shadow-xs">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Video size={14} className="text-white drop-shadow-sm" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold bg-neutral-200/60 px-2 py-0.5 rounded-md inline-block mb-1">
                      {project.category}
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-900 truncate pr-2 tracking-tight">
                      {project.title}
                    </h3>
                  </div>
                </div>
              )}

              {error && !project && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-normal text-center">
                  {error}
                </div>
              )}

              {/* Review Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Client Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-neutral-400" />
                    Nome e Sobrenome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Oliveira"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-50/50 hover:bg-white focus:bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 rounded-xl px-4 py-3 text-neutral-900 placeholder:text-neutral-400 text-sm font-normal transition-all shadow-xs outline-none"
                  />
                </div>

                {/* Stars Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Star size={13} className="text-neutral-400" />
                      Sua nota para o vídeo *
                    </label>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      {STAR_LABELS[activeStarCount] || "Excelente"}
                    </span>
                  </div>
                  <div className="flex gap-2.5 justify-center py-3.5 bg-neutral-50/60 rounded-2xl border border-neutral-200/60">
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const isActive = starIndex <= activeStarCount;
                      return (
                        <button
                          key={starIndex}
                          type="button"
                          onClick={() => setStars(starIndex)}
                          onMouseEnter={() => setHoverStars(starIndex)}
                          onMouseLeave={() => setHoverStars(null)}
                          className="p-1 focus:outline-none transform hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                          aria-label={`${starIndex} estrelas`}
                        >
                          <Star
                            size={28}
                            className={`${
                              isActive
                                ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                                : "text-neutral-200 hover:text-amber-300"
                            } transition-colors duration-150`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-neutral-400" />
                    Seu comentário sobre o vídeo *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Conte como foi receber esse material, o impacto que gerou ou o que achou da produção..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-neutral-50/50 hover:bg-white focus:bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 rounded-xl p-3.5 text-neutral-900 placeholder:text-neutral-400 text-sm font-normal resize-none leading-relaxed transition-all shadow-xs outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-neutral-900 hover:bg-black active:scale-[0.98] text-white text-sm font-semibold tracking-wide py-3.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  Enviar Avaliação
                  <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="text-center py-6"
            >
              {/* Success Icon */}
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <Check size={28} />
              </div>

              <span className="inline-block text-emerald-600 text-[11px] font-mono uppercase tracking-[0.2em] mb-2 font-semibold">
                Enviado com sucesso
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-3">
                Muito Obrigado!
              </h2>
              <p className="text-neutral-500 text-sm font-light max-w-sm mx-auto mb-7 leading-relaxed">
                Sua avaliação sobre o projeto <strong className="text-neutral-800 font-medium">{project?.title || "Daniel Vale"}</strong> foi registrada com sucesso.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-black text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
                >
                  <ArrowLeft size={16} />
                  Visitar Portfólio
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
