import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#141414] text-white py-10 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
        {/* Logo */}
        <div className="md:w-1/4 flex justify-center md:justify-start">
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="text-[22px] font-bold tracking-tight text-white flex items-center gap-0.5"
          >
            Daniel Vale<span className="text-[#FF6321]">.</span>
          </Link>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[14px] font-medium text-white/50">
          <Link to="/work" className="hover:text-white transition-colors duration-300">Trabalhos</Link>
          <Link to="/sobre" className="hover:text-white transition-colors duration-300">Serviços</Link>
          <Link to="/sobre" className="hover:text-white transition-colors duration-300">Sobre</Link>
          <Link to="/contato" className="hover:text-white transition-colors duration-300">Contato</Link>
          <a href="https://instagram.com/danielvaleweb" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">Instagram</a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">YouTube</a>
        </div>

        {/* Copyright & Developer */}
        <div className="md:w-1/4 flex flex-col items-center md:items-end gap-2 text-[13px] text-white/30 font-light text-center md:text-right">
          <span>© {currentYear} Daniel Vale. Todos os direitos reservados.</span>
          <a 
            href="https://anima-system.vercel.app/" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 text-white/40 hover:text-white transition-all duration-300 group"
          >
            <span className="text-xs">Desenvolvido por</span>
            <span className="flex items-center gap-1 font-semibold text-white/90 group-hover:text-green-400 transition-colors">
              <Zap size={14} className="text-green-400 fill-green-400/30 group-hover:fill-green-400/60 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)] transition-all duration-300" />
              AnimaSystem
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

