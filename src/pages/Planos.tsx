import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { Check, Camera, Clock, ArrowUpRight, CloudRain } from "lucide-react";
import BlurText from "../components/BlurText";
import CircularText from "../components/CircularText";

interface PlanItem {
  id: string;
  name: string;
  badge: string;
  popular?: boolean;
  originalPrice?: string;
  promoBadge?: string;
  priceDisplay: string;
  pricePeriod: string;
  priceSubtext: string;
  priceComparison?: string;
  priceComparisonSub?: string;
  description: string;
  features: string[];
  ctaMessage: string;
}

const plans: PlanItem[] = [
  {
    id: "drone-4k",
    name: "DRONE 4K",
    badge: "SOMENTE DRONE",
    priceDisplay: "R$ 300",
    pricePeriod: "/ vídeo",
    priceSubtext: "Produção exclusiva com imagens aéreas",
    description: "Produção audiovisual utilizando exclusivamente drone, com imagens aéreas cinematográficas para apresentação de imóveis, fachadas, terrenos e áreas externas.",
    features: [
      "Imagens aéreas cinematográficas em 4K",
      "Apresentação de fachadas, terrenos e glebas",
      "Valorização de áreas externas e condomínios",
      "Sobrevoo dinâmico de localização e acessos",
      "Drone homologado com piloto capacitado",
      "Tratamento de cor e entrega em alta resolução"
    ],
    ctaMessage: "Olá Daniel! Gostaria de contratar o plano DRONE 4K (R$ 300 por vídeo)."
  },
  {
    id: "filmagem-4k",
    name: "FILMAGEM 4K",
    badge: "SOMENTE CÂMERA",
    priceDisplay: "R$ 350",
    pricePeriod: "/ vídeo",
    priceSubtext: "Produção em solo com câmera mirrorless",
    description: "Produção audiovisual utilizando exclusivamente câmera mirrorless 4K, com imagens estabilizadas, movimentos cinematográficos e tratamento profissional de imagem.",
    features: [
      "Gravação em 4K com câmera mirrorless de cinema",
      "Estabilização fluida com gimbal profissional",
      "Movimentos cinematográficos e imersivos",
      "Tratamento profissional de imagem (Color Grading)",
      "Captação minuciosa dos ambientes e acabamentos",
      "Iluminação auxiliar para valorização de interiores"
    ],
    ctaMessage: "Olá Daniel! Gostaria de contratar o plano FILMAGEM 4K (R$ 350 por vídeo)."
  },
  {
    id: "profissional",
    name: "BLACK PRO",
    badge: "BLACK FIM DE ANO",
    popular: true,
    originalPrice: "De R$ 400",
    promoBadge: "PROMOÇÃO",
    priceDisplay: "R$ 250",
    pricePeriod: "/ vídeo",
    priceSubtext: "R$ 2.500,00 por mês",
    priceComparison: "Vídeos Avulsos R$ 250",
    priceComparisonSub: "só na Black",
    description: "Drone + câmera. O pacote mensal mais pedido da Black Imobiliária com 10 vídeos completos em condição especial de campanha.",
    features: [
      "10 vídeos imobiliários completos por mês",
      "Captação combinada com Drone 4K e Câmera Profissional",
      "Gravação em perfil Log para finalização cinematográfica",
      "Estabilização com Gimbal profissional",
      "Áudio profissional captado com Hollyland Lark M2",
      "Design de som imersivo e trilhas sonoras licenciadas",
      "Entrega expressa com link de download em alta resolução"
    ],
    ctaMessage: "Olá Daniel! Quero contratar o plano PROFISSIONAL (Drone + Câmera por R$ 250 por vídeo / R$ 2.500 no mês)."
  },
  {
    id: "geracao-ia",
    name: "GERAÇÃO IA",
    badge: "GERAÇÃO IA",
    priceDisplay: "R$ 50 à 150",
    pricePeriod: "",
    priceSubtext: "Dependendo da utilização no imóvel por vídeo",
    description: "Produção de vídeos a partir de projetos arquitetônicos, renders e modelos 3D, transformando imagens e projetos estáticos em apresentações audiovisuais com movimentos de câmera, animações e efeitos cinematográficos.",
    features: [
      "Animação e geração de cenas com Inteligência Artificial",
      "Transformação de renders e plantas 3D estáticas em vídeo",
      "Movimentos de câmera e transições cinematográficas virtuais",
      "Efeitos visuais, iluminação e texturização dinâmica",
      "Ideal para lançamentos na planta e decorados virtuais",
      "Trilha sonora e finalização em alta definição"
    ],
    ctaMessage: "Olá Daniel! Gostaria de contratar o plano GERAÇÃO IA (R$ 50 a 150 por vídeo)."
  }
];

const rainDrops = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  left: `${(i * 3.3 - 6).toFixed(1)}%`,
  height: `${18 + (i % 5) * 5}px`,
  opacity: 0.18 + (i % 4) * 0.12,
  duration: 0.75 + (i % 5) * 0.15,
  delay: (i % 9) * 0.14,
}));

export default function Planos() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isBoraHovered, setIsBoraHovered] = useState(false);

  // Animação de entrada em duas etapas (idêntica à Home): primeiro o círculo com seta, depois o texto giratório
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

  const getWhatsAppLink = (message: string) => {
    return `https://wa.me/5532998288650?text=${encodeURIComponent(message)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-20 md:pt-24 pb-0 bg-[#f7eee7] overflow-x-hidden flex flex-col justify-between"
    >
      {/* Imagem no Topo com Drone Animado */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full flex justify-center items-center select-none"
      >
        <div className="relative w-full max-w-[1920px] mx-auto">
          <img
            src="https://i.imgur.com/NDG2aL5.png"
            alt="Daniel Vale - Black Imobiliária"
            className="w-full h-auto object-contain mx-auto pointer-events-none"
            referrerPolicy="no-referrer"
          />

          {/* Drone Flutuando Acima do Ombro (Bem Maior e Mais Alto) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [-8, 10, -6, 9, -8],
              rotate: [-1.5, 2, -1.8, 1.5, -1.5],
            }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { duration: 0.8 },
              y: {
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="absolute -top-[8%] sm:-top-[10%] md:-top-[12%] lg:-top-[14%] left-[50%] sm:left-[52%] md:left-[53%] w-36 h-36 sm:w-52 sm:h-52 md:w-72 md:h-72 lg:w-88 lg:h-88 xl:w-96 xl:h-96 pointer-events-none z-20 filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.4)]"
          >
            <img
              src="https://www-cdn.djiits.com/dps/b011864ecbe030f5533bb4aa75654377.png"
              alt="Drone DJI Flutuando"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Seção dos Cards Totalmente Transparente */}
      <section className="w-full bg-transparent relative z-10 -mt-6 md:-mt-12 lg:-mt-20">
        <div className="max-w-7xl mx-auto px-6 bg-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-y-10 lg:gap-6 items-stretch bg-transparent pt-4">
            {plans.map((plan, index) => {
              const isPopular = plan.popular;
              return (
                <motion.div
                  key={plan.id}
                  onMouseEnter={() => setHoveredCard(plan.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 * index }}
                  className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${isPopular
                    ? "bg-neutral-950/95 backdrop-blur-md text-white ring-2 ring-red-600 shadow-[0_25px_50px_rgba(0,0,0,0.35)] scale-100 lg:scale-[1.05] lg:-translate-y-4 z-20"
                    : "bg-white/85 backdrop-blur-md text-neutral-900 border border-neutral-300/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:bg-white/95 hover:border-neutral-400"
                    }`}
                >
                  {/* Selo do Card */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                      <span
                        className={`rounded-full uppercase transition-all ${isPopular
                          ? "px-5 py-1.5 text-xs font-black tracking-wider bg-red-600 text-white shadow-lg shadow-red-600/40 ring-2 ring-red-500/60"
                          : "px-3.5 py-1 text-[11px] font-bold tracking-wider bg-neutral-900 text-white border border-neutral-700 shadow-md"
                          }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Drone Animado no Hover do Card do Drone (Canto Inferior Direito) */}
                  {plan.id === "drone-4k" && (
                    <AnimatePresence>
                      {hoveredCard === "drone-4k" && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.7, y: 15 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            y: [-6, 8, -5, 7, -6],
                            rotate: [-1.2, 1.8, -1.5, 1.2, -1.2],
                          }}
                          exit={{ opacity: 0, scale: 0.7, y: 15, transition: { duration: 0.25 } }}
                          transition={{
                            opacity: { duration: 0.35 },
                            scale: { duration: 0.35 },
                            y: {
                              duration: 4.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                            rotate: {
                              duration: 4.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            },
                          }}
                          className="absolute -bottom-8 -right-6 sm:-bottom-10 sm:-right-8 md:-bottom-12 md:-right-10 w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 pointer-events-none z-30 select-none filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
                        >
                          <img
                            src="https://www-cdn.djiits.com/dps/b011864ecbe030f5533bb4aa75654377.png"
                            alt="Drone 4K DJI"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  <div>
                    {/* Título do Plano */}
                    <div className="mb-4 pt-2">
                      <h3 className="text-2xl font-bold tracking-tight mb-2">
                        {plan.name}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed ${isPopular ? "text-neutral-300" : "text-neutral-600"
                          }`}
                      >
                        {plan.description}
                      </p>
                    </div>

                    {/* Bloco de Preço */}
                    <div
                      className={`p-4 rounded-2xl mb-6 transition-colors ${isPopular
                        ? "bg-neutral-900 border border-neutral-800"
                        : "bg-neutral-100/70 border border-neutral-200/70"
                        }`}
                    >
                      {/* Selo Promocional e Valor Riscado (estilo print 2 nas cores vermelhas) */}
                      {plan.originalPrice && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-neutral-400 line-through decoration-red-500 decoration-2">
                            {plan.originalPrice}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                            {plan.promoBadge || "PROMOÇÃO"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                        <span className={`font-extrabold tracking-tight ${plan.id === "geracao-ia" ? "text-2xl sm:text-[26px]" : "text-3xl"
                          } ${isPopular ? "text-white" : "text-neutral-950"}`}>
                          {plan.priceDisplay}
                        </span>
                        {plan.pricePeriod && (
                          <span className={`text-xs font-semibold shrink-0 ${isPopular ? "text-neutral-400" : "text-neutral-500"}`}>
                            {plan.pricePeriod}
                          </span>
                        )}
                      </div>

                      {/* Texto verde no plano PROFISSIONAL ou texto normal nos demais */}
                      <p className={`text-[12px] font-semibold mt-1.5 leading-snug ${isPopular ? "text-emerald-400" : "text-neutral-600"
                        }`}>
                        {plan.priceSubtext}
                      </p>

                      {/* Valor comparativo no plano PROFISSIONAL */}
                      {plan.priceComparison && (
                        <div className="mt-1.5 leading-snug">
                          <p className="text-[12px] sm:text-[13px] font-semibold text-white">
                            {plan.priceComparison}
                          </p>
                          {plan.priceComparisonSub && (
                            <p className="text-[11px] font-bold text-red-500 mt-0.5">
                              {plan.priceComparisonSub}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                        O que está incluso:
                      </span>
                      {plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2.5">
                          <div
                            className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${isPopular
                              ? "bg-red-600/20 text-red-400"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              }`}
                          >
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span
                            className={`text-xs leading-snug font-normal ${isPopular ? "text-neutral-200" : "text-neutral-700"
                              }`}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Ação CTA */}
                  <div className="pt-4 border-t border-dashed border-neutral-300/40">
                    <a
                      href={getWhatsAppLink(plan.ctaMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${isPopular
                        ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30"
                        : "bg-neutral-900 hover:bg-black text-white hover:shadow-md"
                        }`}
                    >
                      <Camera size={16} />
                      <span>Bora Gravar!</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Card Horizontal: Até na chuva (Condição Climática Especial) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="relative rounded-3xl mt-12 md:mt-16 z-10"
          >
              {/* Selo do Card no Topo (Preenchido Branco, Fonte Preta - Igual aos outros cards) */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap">
                <span className="px-4 py-1 text-[11px] font-bold tracking-wider uppercase bg-white text-black rounded-full border border-neutral-300 shadow-md">
                  CONDIÇÃO CLIMÁTICA
                </span>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-7 sm:p-9 md:p-10 bg-neutral-950/95 backdrop-blur-md text-white border border-neutral-800 shadow-[0_25px_50px_rgba(0,0,0,0.4)]">
                {/* Efeito Climático: Nuvens e Chuva Caindo na Diagonal */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  {/* Chuva Caindo na Diagonal */}
                  {rainDrops.map((drop) => (
                    <motion.div
                      key={drop.id}
                      initial={{ y: -60, x: 0, opacity: 0 }}
                      animate={{
                        y: [-50, 480],
                        x: [0, 160],
                        opacity: [0, drop.opacity, drop.opacity, 0],
                      }}
                      transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: drop.delay,
                      }}
                      style={{ left: drop.left, height: drop.height }}
                      className="absolute w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-sky-300/80 to-sky-100 rotate-[22deg] pointer-events-none"
                    />
                  ))}

                  {/* Nuvem 1 (Frente, mais rápida e suave) */}
                  <motion.div
                    animate={{
                      x: ["-260px", "120%"],
                      y: [0, -8, 6, -6, 0],
                    }}
                    transition={{
                      x: {
                        duration: 22,
                        repeat: Infinity,
                        ease: "linear",
                      },
                      y: {
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="absolute top-2 sm:top-4 left-0 opacity-15 filter blur-[1px] text-sky-200"
                  >
                    <svg width="240" height="140" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                    </svg>
                  </motion.div>

                  {/* Nuvem 2 (Fundo, mais lenta e ampla) */}
                  <motion.div
                    animate={{
                      x: ["-320px", "120%"],
                      y: [0, 10, -8, 0],
                    }}
                    transition={{
                      x: {
                        duration: 32,
                        repeat: Infinity,
                        ease: "linear",
                        delay: 11,
                      },
                      y: {
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    className="absolute bottom-1 sm:bottom-2 left-0 opacity-10 filter blur-[2px] text-white"
                  >
                    <svg width="300" height="170" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                    </svg>
                  </motion.div>

                  {/* Brilho radial suave no fundo */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full filter blur-3xl pointer-events-none" />
                </div>

                {/* Conteúdo do Card */}
                <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 md:gap-10">
                  {/* Coluna Esquerda: Informações e Bio */}
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
                      Até na chuva
                    </h3>

                    <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl mb-6 font-normal">
                      O tempo fechou? A gente não para! Quando o tempo estiver ruim, nublado ou chuvoso, conseguimos esse valor promocional exclusivo para você não deixar de produzir e vender seu imóvel!
                    </p>

                    {/* Lista de Recursos / Checks da Black com Drone Riscado */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-1">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-sky-500/20 text-sky-400">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs sm:text-[13px] leading-snug line-through text-neutral-500 decoration-red-500 decoration-2">
                            Captação com Drone 4K
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-sky-500/20 text-sky-400">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs sm:text-[13px] leading-snug text-neutral-200 font-medium">
                            Captação com Câmera Profissional
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-sky-500/20 text-sky-400">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs sm:text-[13px] leading-snug text-neutral-200">
                            Estabilização fluida com Gimbal profissional
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-sky-500/20 text-sky-400">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs sm:text-[13px] leading-snug text-neutral-200">
                            Design de som imersivo e trilhas sonoras licenciadas
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-sky-500/20 text-sky-400">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs sm:text-[13px] leading-snug text-neutral-200">
                            Gravação em perfil Log para finalização cinematográfica
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-sky-500/20 text-sky-400">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs sm:text-[13px] leading-snug text-neutral-200">
                            Áudio profissional captado com Hollyland Lark M2
                          </span>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-sky-500/20 text-sky-400">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs sm:text-[13px] leading-snug text-neutral-200">
                            Entrega expressa com link de download em alta resolução
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita: Preço Promocional e CTA */}
                  <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-5 p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-inner">
                    <div className="text-center sm:text-left lg:text-right">
                      <div className="flex items-center justify-center sm:justify-start lg:justify-end gap-2 mb-1">
                        <span className="text-xs font-semibold text-neutral-400 line-through">
                          De R$ 250
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-sky-400 text-neutral-950 px-2 py-0.5 rounded-full">
                          PROMOÇÃO
                        </span>
                      </div>
                      <div className="flex items-baseline justify-center sm:justify-start lg:justify-end gap-1.5 whitespace-nowrap">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                          R$ 200
                        </span>
                        <span className="text-xs font-semibold text-neutral-400">
                          / vídeo
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-sky-300 mt-1">
                        O valor de 250 sai por 200
                      </p>
                    </div>

                    <a
                      href={getWhatsAppLink("Olá Daniel! Gostaria de aproveitar a condição promocional do plano 'Até na chuva' (R$ 200 por vídeo em dia chuvoso/nublado).")}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto lg:w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-neutral-950 hover:text-black shadow-lg shadow-sky-500/25 transition-all duration-300 cursor-pointer active:scale-95"
                    >
                      <Camera size={16} />
                      <span>Bora Gravar!</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

                      {/* Seção Bora Gravar? com Círculo Giratório */}
                      <div ref={boraSectionRef} className="w-full overflow-visible mt-20 md:mt-28 mb-16 md:mb-24 px-4 flex flex-col items-center">
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
                                href={`https://wa.me/5532998288650?text=${encodeURIComponent("Olá Daniel! Vim pela página de planos e gostaria de conversar sobre um projeto. Bora gravar?")}`}
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
                              href={`https://wa.me/5532998288650?text=${encodeURIComponent("Olá Daniel! Vim pela página de planos e gostaria de conversar sobre um projeto. Bora gravar?")}`}
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
                    </div>
                  </section>

                  {/* Faixa Vermelha Fixada no Rodapé Imediatamente Acima do Rodapé Preto */}
                  <div className="w-full bg-red-600 text-white py-3.5 sm:py-4 px-4 shadow-[0_-4px_25px_rgba(220,38,38,0.25)] relative z-20 border-t border-red-500/30">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-[13px] md:text-sm font-medium tracking-wide text-center">
                      <div className="flex items-center gap-2 shrink-0">
                        <Clock size={16} className="text-white shrink-0" />
                        <span>Campanha <strong className="font-bold text-white">Black Imobiliária</strong> válida até <strong className="font-bold text-white">dezembro de 2026</strong>.</span>
                      </div>
                      <span className="hidden sm:inline text-white/75">•</span>
                      <span>Válido para <strong className="font-bold text-white">mensalistas e vídeos avulsos</strong> enquanto ter agenda disponível.</span>
                    </div>
                  </div>
                </motion.div>
                );
}
