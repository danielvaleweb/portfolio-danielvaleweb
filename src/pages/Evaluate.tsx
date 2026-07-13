import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Project } from "../types";
import { getProjects, addEvaluation } from "../utils/storage";
import { Star, Check, Video, User, MessageSquare, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center py-12 px-6 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 overflow-hidden">
        
        {/* Progress Bar or Elegant Accents */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500" />

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {/* Brand Header */}
              <div className="text-center mb-8">
                <span className="inline-block text-[#FF6321] text-xs font-mono uppercase tracking-[0.25em] mb-2 font-semibold">
                  Daniel Vale | Videomaker
                </span>
                <h1 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">
                  Deixe sua Avaliação
                </h1>
                <p className="text-neutral-400 text-sm font-light">
                  Sua opinião é fundamental para evoluirmos e comemorarmos este projeto juntos.
                </p>
              </div>

              {/* Project Preview Badge */}
              {project && (
                <div className="mb-8 flex items-center gap-4 bg-neutral-950 border border-neutral-800/80 rounded-2xl p-4">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0 relative border border-neutral-800">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Video size={16} className="text-white/80" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF6321] font-semibold">
                      {project.category}
                    </span>
                    <h3 className="text-base font-bold text-white truncate pr-2 tracking-tight">
                      {project.title}
                    </h3>
                  </div>
                </div>
              )}

              {error && !project && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs font-light text-center">
                  {error}
                </div>
              )}

              {/* Review Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Client Name Input */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-2">
                    <User size={13} className="text-[#FF6321]" />
                    Nome e Sobrenome *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Oliveira"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all font-medium"
                  />
                </div>

                {/* Stars Selection */}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-2">
                    <Star size={13} className="text-[#FF6321]" />
                    Sua nota para o vídeo *
                  </label>
                  <div className="flex gap-2 justify-center py-3 bg-neutral-950/40 rounded-2xl border border-neutral-800/40">
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const isActive = hoverStars !== null ? starIndex <= hoverStars : starIndex <= stars;
                      return (
                        <button
                          key={starIndex}
                          type="button"
                          onClick={() => setStars(starIndex)}
                          onMouseEnter={() => setHoverStars(starIndex)}
                          onMouseLeave={() => setHoverStars(null)}
                          className="p-1 focus:outline-none transform hover:scale-125 transition-all cursor-pointer"
                        >
                          <Star
                            size={32}
                            className={`${
                              isActive
                                ? "fill-[#FF6321] text-[#FF6321]"
                                : "text-neutral-700 hover:text-neutral-500"
                            } transition-colors duration-150`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-2">
                    <MessageSquare size={13} className="text-[#FF6321]" />
                    Seu comentário sobre o vídeo *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Conte como foi receber esse material, o impacto que gerou ou o que achou da produção..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#FF6321] focus:ring-1 focus:ring-[#FF6321]/20 transition-all font-light resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#FF6321] hover:bg-orange-600 active:scale-[0.98] text-white text-sm font-semibold tracking-wide py-4 px-6 rounded-xl shadow-[0_10px_20px_rgba(255,99,33,0.15)] hover:shadow-[0_10px_25px_rgba(255,99,33,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-8"
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
              className="text-center py-8"
            >
              {/* Success Icon */}
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-6">
                <Check size={32} />
              </div>

              <span className="inline-block text-green-400 text-xs font-mono uppercase tracking-[0.2em] mb-2 font-semibold">
                Enviado com sucesso
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">
                Muito Obrigado!
              </h2>
              <p className="text-neutral-400 text-sm font-light max-w-sm mx-auto mb-8 leading-relaxed">
                Sua avaliação sobre o projeto <strong className="text-white font-medium">{project?.title || "Daniel Vale"}</strong> foi registrada. Em breve ela aparecerá em nosso portfólio de avaliações!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold rounded-xl border border-neutral-700 transition-colors"
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
