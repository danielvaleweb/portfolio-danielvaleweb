import { useState, useEffect, useRef } from "react";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import BlurText from "../components/BlurText";
import LogoLoop from "../components/LogoLoop";
import CircularText from "../components/CircularText";
import { ArrowUpRight } from "lucide-react";
import { Client } from "../types";
import { getClients } from "../utils/storage";
import { motion, useInView } from "motion/react";

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isBoraHovered, setIsBoraHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Animação de entrada em duas etapas: primeiro o círculo com seta, depois o texto giratório
  const boraSectionRef = useRef<HTMLDivElement>(null);
  const isBoraInView = useInView(boraSectionRef, { once: true, amount: 0.3 });
  const [showCenterCircle, setShowCenterCircle] = useState(false);
  const [showCircularText, setShowCircularText] = useState(false);

  useEffect(() => {
    if (!isBoraInView) return;

    // 1. Aparece 1 segundo após chegar na sessão (primeiro o círculo com a seta)
    const t1 = setTimeout(() => {
      setShowCenterCircle(true);
    }, 1000);

    // 2. Em seguida, aparece o texto giratório ao redor (1.4s)
    const t2 = setTimeout(() => {
      setShowCircularText(true);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isBoraInView]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setClients(getClients());

    const handleClientsUpdate = () => {
      setClients(getClients());
    };

    window.addEventListener("clients-updated", handleClientsUpdate);

    // Support scrolling to target hash if coming from another route
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const offset = 96;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100);
    }

    return () => {
      window.removeEventListener("clients-updated", handleClientsUpdate);
    };
  }, []);

  // Logo Loop: Apenas o nome da empresa em badges de texto (sem foto)
  const uniqueCompanyNames = Array.from(
    new Set(
      clients
        .map((c) => (c.company?.trim() || c.name?.trim() || ''))
        .filter((name) => name.length > 0)
    )
  );

  const logoItems = uniqueCompanyNames.map((companyName) => ({
    node: (
      <span className="font-bold text-neutral-800 tracking-wider text-xs md:text-sm uppercase px-6 py-3 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/70 rounded-2xl whitespace-nowrap select-none transition-all duration-300 shadow-2xs">
        {companyName}
      </span>
    ),
    title: companyName,
    alt: companyName,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <div className="py-20">
        <Gallery />
        <div ref={boraSectionRef} className="w-full overflow-visible mt-4 md:mt-10 px-4 flex flex-col items-center">
          {/* MODO MOBILE: Quebra de linha ("Bora" / "Gravar?"), fonte bem maior e Círculo com seta ao lado do "Bora" */}
          <div
            className="flex md:hidden flex-col items-center select-none cursor-pointer"
            onMouseEnter={() => setIsBoraHovered(true)}
            onMouseLeave={() => setIsBoraHovered(false)}
          >
            {/* Linha 1: "Bora" + Círculo ao lado */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <BlurText
                text="Bora"
                delay={80}
                animateBy="letters"
                direction="bottom"
                className="text-black text-[18vw] sm:text-7xl font-helvetica font-black tracking-tighter leading-none flex-nowrap whitespace-nowrap"
              />
              <div className="relative pointer-events-auto flex items-center justify-center flex-shrink-0">
                <a
                  href={`https://wa.me/5532998288650?text=${encodeURIComponent("Olá Daniel! Vim pelo site e gostaria de conversar sobre um projeto. Bora gravar?")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block select-none cursor-pointer"
                  title="Solicitar orçamento pelo WhatsApp"
                  aria-label="Solicitar orçamento no WhatsApp"
                >
                  <CircularText
                    text="• BORA GRAVAR • SOLICITAR ORÇAMENTO "
                    onHover="speedUp"
                    spinDuration={isBoraHovered ? 8 : 18}
                    size={110}
                    fontSize={8.5}
                    fontWeight={800}
                    color={isBoraHovered ? "#dc2626" : undefined}
                    showText={showCircularText}
                    className={`transition-colors duration-300 ${isBoraHovered ? "!text-red-600" : "text-black"}`}
                  >
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={showCenterCircle ? { scale: isBoraHovered ? 1.1 : 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{
                        scale: { duration: 0.5, type: "spring", stiffness: 320, damping: 20 },
                        opacity: { duration: 0.3 }
                      }}
                      className={`w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-shadow duration-300 ${isBoraHovered ? "shadow-red-600/50" : ""}`}
                    >
                      <motion.div
                        animate={isBoraHovered ? {
                          x: [0, 4, 0],
                          y: [0, -4, 0]
                        } : { x: 0, y: 0 }}
                        transition={{
                          duration: 0.6,
                          repeat: isBoraHovered ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                        className="flex items-center justify-center"
                      >
                        <ArrowUpRight size={19} strokeWidth={2.4} className="text-white" />
                      </motion.div>
                    </motion.div>
                  </CircularText>
                </a>
              </div>
            </div>

            {/* Linha 2: "Gravar?" */}
            <div className="flex items-center justify-center -mt-2 sm:-mt-3">
              <BlurText
                text="Gravar?"
                delay={80}
                animateBy="letters"
                direction="bottom"
                className="text-black text-[18vw] sm:text-7xl font-helvetica font-black tracking-tighter leading-none flex-nowrap whitespace-nowrap"
              />
            </div>
          </div>

          {/* MODO DESKTOP: Linha única com Círculo no canto superior direito do '?' */}
          <div
            className="hidden md:inline-block relative select-none cursor-pointer"
            onMouseEnter={() => setIsBoraHovered(true)}
            onMouseLeave={() => setIsBoraHovered(false)}
          >
            <BlurText
              text="Bora gravar?"
              delay={80}
              animateBy="letters"
              direction="bottom"
              className="text-black text-6xl md:text-8xl lg:text-[10vw] font-helvetica font-black tracking-tighter leading-tight text-center justify-center select-none w-full max-w-7xl mx-auto flex-nowrap whitespace-nowrap cursor-pointer"
            />

            {/* Circular Text com seta no Desktop */}
            <div className="md:absolute md:-top-6 lg:-top-8 md:-right-8 lg:-right-10 z-20 pointer-events-auto flex justify-center items-center">
              <a
                href={`https://wa.me/5532998288650?text=${encodeURIComponent("Olá Daniel! Vim pelo site e gostaria de conversar sobre um projeto. Bora gravar?")}`}
                target="_blank"
                rel="noreferrer"
                className="relative block select-none cursor-pointer"
                title="Solicitar orçamento pelo WhatsApp"
                aria-label="Solicitar orçamento no WhatsApp"
              >
                <CircularText
                  text="• BORA GRAVAR • SOLICITAR ORÇAMENTO "
                  onHover="speedUp"
                  spinDuration={isBoraHovered ? 8 : 18}
                  size={160}
                  fontSize={12}
                  fontWeight={800}
                  color={isBoraHovered ? "#dc2626" : undefined}
                  showText={showCircularText}
                  className={`transition-colors duration-300 ${isBoraHovered ? "!text-red-600" : "text-black"}`}
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={showCenterCircle ? { scale: isBoraHovered ? 1.1 : 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{
                      scale: { duration: 0.5, type: "spring", stiffness: 320, damping: 20 },
                      opacity: { duration: 0.3 }
                    }}
                    className={`w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 transition-shadow duration-300 ${isBoraHovered ? "shadow-red-600/50" : ""}`}
                  >
                    <motion.div
                      animate={isBoraHovered ? {
                        x: [0, 4, 0],
                        y: [0, -4, 0]
                      } : { x: 0, y: 0 }}
                      transition={{
                        duration: 0.6,
                        repeat: isBoraHovered ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                      className="flex items-center justify-center"
                    >
                      <ArrowUpRight size={24} strokeWidth={2.4} className="text-white" />
                    </motion.div>
                  </motion.div>
                </CircularText>
              </a>
            </div>
          </div>
        </div>

        {logoItems.length > 0 && (
          <div className="w-full mt-20 md:mt-28 flex flex-col">
            <div className="w-full px-6 md:px-12 mb-6 text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
                Empresa e pessoas
              </h2>
              <p className="text-gray-500 mt-2">
                Que confiam em nosso trabalho e dedicação!
              </p>
            </div>

            <div className="w-full py-8 border-y border-neutral-100 flex items-center bg-white overflow-hidden">
              <LogoLoop
                logos={logoItems}
                speed={40}
                direction="left"
                logoHeight={40}
                gap={80}
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Empresas e pessoas que confiam em nosso trabalho e dedicação!"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
