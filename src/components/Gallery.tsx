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

export default function Gallery() {
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [visibleImobiliario, setVisibleImobiliario] = useState(6);
  const [visibleEventos, setVisibleEventos] = useState(6);

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

  const imobiliarioProjects = allProjects.filter((project) => {
    const cat = (project.category || "").toLowerCase();
    return cat.includes("imobil") || cat.includes("casa") || cat.includes("apart") || cat.includes("mans");
  });

  const eventosProjects = allProjects.filter((project) => {
    const cat = (project.category || "").toLowerCase();
    return cat.includes("event");
  });

  const showMoreImobiliario = () => {
    setVisibleImobiliario(prev => Math.min(prev + 6, imobiliarioProjects.length));
  };

  const showMoreEventos = () => {
    setVisibleEventos(prev => Math.min(prev + 6, eventosProjects.length));
  };

  return (
    <section id="trabalhos" className="pb-20 scroll-mt-24 flex flex-col items-center w-full">
      {/* 1st Section: Vídeos Imobiliários */}
      <div className="w-full max-w-[1600px] px-6 md:px-12 mx-auto mb-8 text-left">
        <h2 className="text-4xl font-bold text-black tracking-tight">Vídeos Imobiliários</h2>
        <p className="text-gray-500 mt-2">Uma seleção dos vídeos imobiliários de elite</p>
      </div>

      <div className="w-full max-w-[1600px] px-6 md:px-12 mx-auto mb-16 flex flex-col items-center">
        {imobiliarioProjects.length === 0 ? (
          <div className="text-center py-12 w-full border border-dashed border-neutral-200 rounded-2xl bg-white/50">
            <p className="text-neutral-400 font-light text-sm">Nenhum vídeo publicado nesta categoria ainda.</p>
          </div>
        ) : (
          <>
            <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 gap-4 w-[calc(100%+3rem)] -mx-6 px-6 md:w-full md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-4 md:pb-0 md:overflow-x-visible md:snap-none">
              {imobiliarioProjects.slice(0, visibleImobiliario).map((project, index) => {
                const col = index % 3;
                const rightToLeftDelay = (2 - col) * 0.15;
                const rowDelay = Math.floor(index / 3) * 0.1;
                const totalDelay = rightToLeftDelay + rowDelay;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ 
                      opacity: 0, 
                      rotateY: -45, 
                      scale: 0.8,
                      x: 50 
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      rotateY: 0, 
                      scale: 1,
                      x: 0 
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.8, 
                      delay: totalDelay,
                      ease: [0.215, 0.61, 0.355, 1] 
                    }}
                    className="relative group cursor-pointer overflow-hidden aspect-video rounded-xl md:rounded-2xl bg-gray-100 flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-auto md:flex-shrink snap-center md:snap-align-none"
                    style={{ perspective: "1000px" }}
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

            {visibleImobiliario < imobiliarioProjects.length && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={showMoreImobiliario}
                className="mt-8 px-12 py-4 rounded-2xl border border-gray-200 text-black font-medium hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 uppercase tracking-[0.2em] text-xs cursor-pointer"
              >
                Ver mais trabalhos
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* 2nd Section: Eventos */}
      <div className="w-full max-w-[1600px] px-6 md:px-12 mx-auto mb-8 text-left mt-12 md:mt-20">
        <h2 className="text-4xl font-bold text-black tracking-tight">Eventos</h2>
        <p className="text-gray-500 mt-2">Resumos de eventos que fazem a diferença</p>
      </div>

      <div className="w-full max-w-[1600px] px-6 md:px-12 mx-auto flex flex-col items-center">
        {eventosProjects.length === 0 ? (
          <div className="text-center py-12 w-full border border-dashed border-neutral-200 rounded-2xl bg-white/50">
            <p className="text-neutral-400 font-light text-sm">Nenhum vídeo publicado nesta categoria ainda.</p>
          </div>
        ) : (
          <>
            <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 gap-4 w-[calc(100%+3rem)] -mx-6 px-6 md:w-full md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-4 md:pb-0 md:overflow-x-visible md:snap-none">
              {eventosProjects.slice(0, visibleEventos).map((project, index) => {
                const col = index % 3;
                const rightToLeftDelay = (2 - col) * 0.15;
                const rowDelay = Math.floor(index / 3) * 0.1;
                const totalDelay = rightToLeftDelay + rowDelay;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ 
                      opacity: 0, 
                      rotateY: -45, 
                      scale: 0.8,
                      x: 50 
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      rotateY: 0, 
                      scale: 1,
                      x: 0 
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.8, 
                      delay: totalDelay,
                      ease: [0.215, 0.61, 0.355, 1] 
                    }}
                    className="relative group cursor-pointer overflow-hidden aspect-video rounded-xl md:rounded-2xl bg-gray-100 flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-auto md:flex-shrink snap-center md:snap-align-none"
                    style={{ perspective: "1000px" }}
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

            {visibleEventos < eventosProjects.length && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={showMoreEventos}
                className="mt-8 px-12 py-4 rounded-2xl border border-gray-200 text-black font-medium hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 uppercase tracking-[0.2em] text-xs cursor-pointer"
              >
                Ver mais trabalhos
              </motion.button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
