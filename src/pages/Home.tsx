import { useState, useEffect, useRef } from "react";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import Process from "../components/Process";
import BlurText from "../components/BlurText";
import LogoLoop from "../components/LogoLoop";
import { Client, Evaluation } from "../types";
import { getClients, getEvaluations } from "../utils/storage";
import { motion } from "motion/react";
import { Star, Play, Pause, Film } from "lucide-react";

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayersRef = useRef<{ [id: string]: HTMLAudioElement }>({});

  useEffect(() => {
    setClients(getClients());
    setEvaluations(getEvaluations());

    const handleClientsUpdate = () => {
      setClients(getClients());
    };
    const handleEvaluationsUpdate = () => {
      setEvaluations(getEvaluations());
    };

    window.addEventListener("clients-updated", handleClientsUpdate);
    window.addEventListener("evaluations-updated", handleEvaluationsUpdate);

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
      window.removeEventListener("evaluations-updated", handleEvaluationsUpdate);
      
      // Clean up audio players
      (Object.values(audioPlayersRef.current) as HTMLAudioElement[]).forEach(player => player.pause());
    };
  }, []);

  const handlePlayPauseAudio = (id: string, audioUrl: string) => {
    if (playingAudioId === id) {
      audioPlayersRef.current[id]?.pause();
      setPlayingAudioId(null);
    } else {
      if (playingAudioId && audioPlayersRef.current[playingAudioId]) {
        audioPlayersRef.current[playingAudioId].pause();
      }

      if (!audioPlayersRef.current[id]) {
        const audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudioId(null);
        audioPlayersRef.current[id] = audio;
      }

      audioPlayersRef.current[id].play()
        .then(() => setPlayingAudioId(id))
        .catch(err => {
          console.error("Error playing evaluation audio", err);
        });
    }
  };

  const logoItems = clients.map((client) => ({
    src: client.logoUrl,
    alt: client.name,
    title: client.name,
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
        <div className="w-full overflow-visible mt-16 md:mt-24 px-4 flex flex-col items-center">
          <BlurText
            text="Bora gravar?"
            delay={80}
            animateBy="letters"
            direction="bottom"
            className="text-black text-4xl sm:text-6xl md:text-8xl lg:text-[10vw] font-helvetica font-black tracking-tighter leading-tight text-center justify-center select-none w-full max-w-7xl mx-auto flex-nowrap whitespace-nowrap"
          />

          {logoItems.length > 0 && (
            <div className="w-full mt-12 md:mt-16 py-8 border-y border-neutral-100 flex items-center bg-white overflow-hidden">
              <LogoLoop
                logos={logoItems}
                speed={40}
                direction="left"
                logoHeight={40}
                gap={80}
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Nossos clientes"
              />
            </div>
          )}

          {/* Evaluations Section */}
          {evaluations.length > 0 && (
            <div className="w-full max-w-7xl mx-auto mt-24 px-6">
              <div className="text-center mb-16">
                <p className="text-neutral-900 font-bold max-w-xl mx-auto text-lg md:text-xl leading-relaxed tracking-tight">
                  Veja o que dizem aqueles que confiaram suas produções audiovisuais ao nosso olhar e lentes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {evaluations.map((evalItem) => (
                  <motion.div
                    key={evalItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-neutral-50/40 border border-neutral-100 hover:border-neutral-200/80 hover:bg-neutral-50/70 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group"
                  >
                    <div>
                      {/* Top profile part */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-white border border-neutral-200/60 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-neutral-800 text-sm shadow-sm">
                          {evalItem.photoUrl ? (
                            <img
                              src={evalItem.photoUrl}
                              alt={evalItem.clientName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-lg text-neutral-800">
                              {evalItem.clientName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 tracking-tight leading-tight">
                            {evalItem.clientName}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 font-mono mt-0.5">
                            <Film size={10} className="text-neutral-500" />
                            {evalItem.projectName}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < evalItem.stars ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"}
                          />
                        ))}
                      </div>

                      {/* Comment text */}
                      <p className="text-neutral-600 text-sm font-light leading-relaxed italic whitespace-pre-line">
                        "{evalItem.comment}"
                      </p>
                    </div>

                    {/* Audio recording player if present */}
                    {evalItem.audioUrl && (
                      <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center gap-3 overflow-visible">
                        <div className="relative group/tooltip">
                          <button
                            type="button"
                            onClick={() => handlePlayPauseAudio(evalItem.id, evalItem.audioUrl!)}
                            className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-black active:scale-95 text-white flex items-center justify-center cursor-pointer transition-all shadow-sm"
                          >
                            {playingAudioId === evalItem.id ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
                          </button>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 text-white text-[10px] font-medium rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 shadow-md">
                            Escute a mensagem de voz
                            {/* Tooltip arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-neutral-800 block">Depoimento em Áudio</span>
                          <span className="text-[9px] text-neutral-400 block font-mono">Clique para reproduzir</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
      <Process />
    </motion.div>
  );
}
