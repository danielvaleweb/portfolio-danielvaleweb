import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";

export default function Hero() {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 500], [0, 10]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0.4]);
  const scrollScale = useTransform(scrollY, [0, 500], [1, 1.15]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section 
      id="home" 
      className="relative min-h-screen w-full bg-white flex flex-col items-center justify-end pt-24 overflow-hidden scroll-mt-24"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{
            scale: scrollScale,
            opacity,
            filter: useTransform(blur, (v) => `blur(${v}px)`),
          }}
          className="w-full h-full"
        >
          <img 
            src="https://res.cloudinary.com/dgarqyegu/image/upload/v1774924727/Gemini_Generated_Image_t2f2tct2f2tct2f2_ww3ttc.png" 
            alt="Background" 
            className="w-full h-full relative object-cover object-center blur-sm brightness-50 md:object-[75%_15%] md:blur-none md:brightness-100 transition-all duration-700 max-w-none"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        {/* Overlays for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/40 to-transparent" />
      </div>

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 md:grid-cols-2 gap-24 items-end pb-24 md:pb-32"
      >
        {/* Left Side */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 md:bg-gray-50 md:border-gray-100"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/80 md:text-gray-500 font-medium">Disponível para novos projetos</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-[39px] font-helvetica font-normal tracking-[-2px] leading-[1.1] text-white md:text-black max-w-xl"
          >
            Transformo momentos em experiências visuais.
          </motion.h1>
        </div>

        {/* Right Side */}
        <div className="space-y-6 md:pl-48 md:pb-16 md:justify-self-end">
          <motion.p 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-white/90 md:text-gray-700 text-[15px] leading-relaxed font-semibold max-w-[450px]"
          >
            Sou videomaker especializado no mercado imobiliário, focado em criar vídeos que elevam a percepção de valor e destacam cada detalhe do imóvel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <motion.a 
              href="https://wa.me/5532998288650" 
              target="_blank" 
              rel="noreferrer" 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white text-[14px] font-semibold shadow-[0_20px_40px_rgba(0,0,0,0.3)] overflow-hidden border-0 outline-none ring-0"
            >
              {/* Base Background - slightly oversized to prevent sub-pixel gaps */}
              <div className="absolute -inset-[1px] bg-black transition-colors duration-500 group-hover:bg-red-600" />

              {/* Innovative Background: Liquid Sweep - slightly oversized */}
              <div className="absolute -inset-[1px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
              </div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="relative h-6 w-2 flex items-center justify-center">
                  {/* Dot - Normal State */}
                  <div className="absolute transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:-translate-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
                    </div>
                  </div>
                  {/* Dot - Hover State */}
                  <div className="absolute opacity-0 translate-y-4 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-y-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
                
                <div className="relative h-6 flex items-center min-w-[110px] -mt-[1px]">
                  {/* REC Text - Normal State */}
                  <span className="absolute left-0 flex items-center text-[14px] font-black text-red-500 tracking-[0.2em] animate-pulse transition-all duration-500 ease-in-out group-hover:opacity-0 group-hover:-translate-y-4">
                    REC
                  </span>
                  {/* Bora gravar? Text - Hover State */}
                  <span className="absolute left-0 flex items-center text-[14px] font-semibold tracking-wide opacity-0 translate-y-4 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:animate-pulse">
                    Bora gravar?
                  </span>
                </div>
              </div>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
