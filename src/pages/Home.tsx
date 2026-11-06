import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Gallery from "../components/Gallery";
import BlurText from "../components/BlurText";
import LogoLoop from "../components/LogoLoop";
import { Client } from "../types";
import { getClients } from "../utils/storage";
import { motion } from "motion/react";

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);

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

        </div>
      </div>
    </motion.div>
  );
}
