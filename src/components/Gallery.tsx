import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Film } from "lucide-react";
import { Project, HomepageCategoryConfig } from "../types";
import { getProjects, sortProjectsByRecent, getHomepageCategories } from "../utils/storage";
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
        src={project.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800"}
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

function VideoSection({ title, subtitle, projects, id }: { title: string; subtitle: string; projects: Project[]; id?: string; key?: any }) {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(4); // Exibir de 4 em 4

  // Garante ordenação decrescente: o mais recente sempre no índice 0 (lado esquerdo)
  const sorted = sortProjectsByRecent(projects);

  const showMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, sorted.length));
  };

  return (
    <div id={id} className="w-full mb-8 md:mb-12 scroll-mt-24">
      <div className="w-full px-6 md:px-12 mb-6 text-left">
        <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">{title}</h2>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>

      <div className="w-full flex flex-col items-center">
        {sorted.length === 0 ? (
          <div className="text-center py-12 w-full max-w-4xl mx-auto border border-dashed border-neutral-200 rounded-2xl bg-white/50">
            <p className="text-neutral-400 font-light text-sm">Nenhum vídeo publicado nesta categoria ainda.</p>
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 px-1 md:px-2">
              {sorted.slice(0, visibleCount).map((project, index) => {
                const col = index % 4;
                const colDelay = col * 0.08;
                const rowDelay = Math.floor(index / 4) * 0.1;
                const totalDelay = colDelay + rowDelay;

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
  const [categoriesConfig, setCategoriesConfig] = useState<HomepageCategoryConfig[]>([]);

  useEffect(() => {
    // Initial load
    setAllProjects(getProjects());
    setCategoriesConfig(getHomepageCategories());

    // Listen for updates
    const handleProjectsUpdate = () => {
      setAllProjects(getProjects());
    };
    const handleCategoriesUpdate = () => {
      setCategoriesConfig(getHomepageCategories());
    };

    window.addEventListener("projects-updated", handleProjectsUpdate);
    window.addEventListener("homepage-categories-updated", handleCategoriesUpdate);
    return () => {
      window.removeEventListener("projects-updated", handleProjectsUpdate);
      window.removeEventListener("homepage-categories-updated", handleCategoriesUpdate);
    };
  }, []);

  // Filtra as categorias configuradas para aparecer (visible === true)
  const visibleCategories = categoriesConfig.filter(cat => cat.visible);

  const getProjectsForCategory = (category: HomepageCategoryConfig) => {
    const catNameLower = category.name.toLowerCase();

    // Projetos não listados (unlisted) NUNCA são exibidos na página principal/galeria pública
    const publicProjects = allProjects.filter(p => p.visibility !== 'unlisted');

    let filtered: Project[] = [];
    if (catNameLower === 'imobiliário' || catNameLower === 'imobiliario') {
      filtered = publicProjects.filter(p => !p.isPhotoGallery && (p.category === 'Imobiliário' || p.category === 'imobiliario'));
    } else if (catNameLower === 'publicitário' || catNameLower === 'publicitario' || catNameLower === 'publicidade') {
      filtered = publicProjects.filter(p => !p.isPhotoGallery && (p.category === 'Publicitário' || p.category === 'Publicidade' || p.category === 'publicitario'));
    } else if (catNameLower === 'eventos') {
      filtered = publicProjects.filter(p => !p.isPhotoGallery && p.category === 'Eventos');
    } else if (catNameLower === 'institucional') {
      filtered = publicProjects.filter(p => !p.isPhotoGallery && p.category === 'Institucional');
    } else if (catNameLower === 'fotos' || catNameLower === 'fotografia') {
      filtered = publicProjects.filter(p => p.isPhotoGallery || p.category === 'Fotos');
    } else {
      filtered = publicProjects.filter(p => p.category?.toLowerCase() === catNameLower);
    }
    return sortProjectsByRecent(filtered);
  };

  if (allProjects.length === 0) {
    return (
      <section id="trabalhos" className="pb-20 scroll-mt-24 flex flex-col items-center w-full px-6">
        <div className="w-full max-w-2xl py-16 px-8 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/50 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
            <Film size={26} />
          </div>
          <h3 className="text-xl font-bold text-neutral-800 mb-2">Novos projetos em breve</h3>
          <p className="text-sm text-neutral-500 max-w-md">
            O portfólio está sendo preparado. Novos trabalhos audiovisuais e cinematográficos serão publicados aqui em breve.
          </p>
        </div>
      </section>
    );
  }

  if (visibleCategories.length === 0) {
    return (
      <section id="trabalhos" className="pb-20 scroll-mt-24 flex flex-col items-center w-full px-6">
        <div className="w-full max-w-2xl py-16 px-8 rounded-3xl border border-dashed border-neutral-200 bg-neutral-50/50 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
            <Film size={26} />
          </div>
          <h3 className="text-xl font-bold text-neutral-800 mb-2">Nenhuma categoria em exibição</h3>
          <p className="text-sm text-neutral-500 max-w-md">
            Todas as categorias estão temporariamente ocultas na página inicial.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="trabalhos" className="pb-2 md:pb-6 scroll-mt-24 flex flex-col items-center w-full">
      {visibleCategories.map((category, index) => {
        const projects = getProjectsForCategory(category);
        const isImobiliario = category.name.toLowerCase().includes("imobili") || category.id === "imobiliario" || index === 0;
        return (
          <VideoSection
            key={category.id}
            id={isImobiliario ? "secao-imobiliario" : `secao-${category.id}`}
            title={category.title || category.name}
            subtitle={category.subtitle}
            projects={projects}
          />
        );
      })}
    </section>
  );
}
