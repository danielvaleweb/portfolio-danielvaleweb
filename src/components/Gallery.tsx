import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "../types";
import { getProjects } from "../utils/storage";
import GlareHover from "./GlareHover";

function BlurImage({ project }: { project: Project }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full relative bg-gray-100 overflow-hidden">
      {/* Blur Placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-10 bg-gray-200 backdrop-blur-2xl"
          />
        )}
      </AnimatePresence>

      <motion.img
        src={project.thumbnail}
        alt={project.title}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        referrerPolicy="no-referrer"
        initial={{ filter: "blur(20px)", scale: 1.1 }}
        animate={{ 
          filter: isLoaded ? "blur(0px)" : "blur(20px)",
          scale: isLoaded ? 1 : 1.1
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full h-full object-cover transition-transform duration-700 ease-out"
      />
    </div>
  );
}

function VideoSection({ title, subtitle, projects }: { title: string; subtitle: string; projects: Project[] }) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(4); // Exibir de 4 em 4

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, projects.length));
  };

  return (
    <div className="w-full mb-16">
      <div className="w-full px-6 md:px-12 mb-6 text-left">
        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">{title}</h2>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>

      <div className="w-full flex flex-col items-center">
        {projects.length === 0 ? (
          <div className="text-center py-12 w-full max-w-4xl mx-auto border border-dashed border-neutral-200 rounded-2xl bg-white/50">
            <p className="text-neutral-400 font-light text-sm">Nenhum vídeo publicado nesta categoria ainda.</p>
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 px-1 md:px-2">
              {projects.slice(0, visibleCount).map((project, index) => {
                const col = index % 4;
                const rightToLeftDelay = (3 - col) * 0.15;
                const rowDelay = Math.floor(index / 4) * 0.1;
                const totalDelay = rightToLeftDelay + rowDelay;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ 
                      opacity: 0, 
                      scale: 0.9,
                      y: 20
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      scale: 1,
                      y: 0 
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.6, 
                      delay: totalDelay,
                      ease: [0.215, 0.61, 0.355, 1] 
                    }}
                    className="relative group cursor-pointer overflow-hidden aspect-square bg-gray-100"
                    onClick={() => navigate(`/projeto/${project.id}`)}
                  >
                    <GlareHover
                      glareColor="#ffffff"
                      glareOpacity={0.3}
                      glareAngle={-30}
                      glareSize={300}
                      transitionDuration={800}
                      playOnce={false}
                      className="w-full h-full"
                    >
                      {/* Image Container */}
                      <div className="w-full h-full overflow-hidden relative">
                        <BlurImage project={project} />
                      </div>
                    </GlareHover>
                  </motion.div>
                );
              })}
            </div>

            {visibleCount < projects.length && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={showMore}
                className="mt-10 px-12 py-4 rounded-2xl border border-gray-200 text-black font-medium hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 uppercase tracking-[0.2em] text-xs cursor-pointer"
              >
                Exibir mais
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Gallery() {
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Initial load
    setAllProjects(getProjects());

    // Listen for updates
    const handleUpdate = () => {
      setAllProjects(getProjects());
    };

    window.addEventListener("projects-updated", handleUpdate);
    return () => {
      window.removeEventListener("projects-updated", handleUpdate);
    };
  }, []);

  const videoProjects = allProjects.filter((project) => !project.isPhotoGallery);

  const imobiliarioVideos = videoProjects.filter(p => p.category === 'Imobiliário');
  const publicitarioVideos = videoProjects.filter(p => p.category === 'Publicitário');
  const institucionalVideos = videoProjects.filter(p => p.category === 'Institucional');

  return (
    <section id="trabalhos" className="pb-20 scroll-mt-24 flex flex-col items-center w-full">
      <VideoSection 
        title="Imobiliário" 
        subtitle="Produções audiovisuais cinematográficas de alto impacto para o mercado imobiliário." 
        projects={imobiliarioVideos} 
      />
      <VideoSection 
        title="Publicitário" 
        subtitle="Campanhas publicitárias e comerciais com narrativa visual envolvente." 
        projects={publicitarioVideos} 
      />
      <VideoSection 
        title="Institucional" 
        subtitle="Vídeos corporativos que transmitem a essência e os valores da sua marca." 
        projects={institucionalVideos} 
      />
    </section>
  );
}
