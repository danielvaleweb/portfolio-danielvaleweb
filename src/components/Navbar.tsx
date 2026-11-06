import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Mail, Instagram, ArrowRight, MessageSquare } from "lucide-react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkSection, setIsDarkSection] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 50);
      
      // Check if we are over a dark section
      const darkSectionIds: string[] = [];
      let isOverDark = false;
      
      for (const id of darkSectionIds) {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          // If the section is under the navbar (height 96px)
          if (rect.top <= 96 && rect.bottom >= 0) {
            isOverDark = true;
            break;
          }
        }
      }

      // Also check footer
      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        if (rect.top <= 96 && rect.bottom >= 0) {
          isOverDark = true;
        }
      }
      
      setIsDarkSection(isOverDark);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Mobile Navbar Opacity based on scroll
  const mNavOpacity = useTransform(scrollY, [50, 150], [0, 1]);

  const textColor = isDarkSection ? "text-white" : "text-black";
  const textColorMuted = isDarkSection ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black";

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate(`/#${targetId}`);
      // Wait a tiny moment for navigation to settle, then scroll
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
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 96; // h-24 = 96px
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  };

  return (
    <motion.nav 
      style={{ opacity: 1 }}
      className={`fixed top-0 left-0 w-full z-50 px-6 md:px-12 h-24 flex items-center transition-all duration-700 border-b pointer-events-none ${
        isScrolled 
          ? `bg-transparent backdrop-blur-md ${isDarkSection ? 'border-white/10' : 'border-black/5'} shadow-sm` 
          : "bg-transparent border-transparent"
      }`}
    >
      {/* Left Logo */}
      <div className="flex-1 flex justify-start items-center pointer-events-auto">
        <a 
          href="/" 
          onClick={(e) => {
            e.preventDefault();
            if (location.pathname !== "/") {
              navigate("/");
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={`text-[20px] font-bold tracking-tight ${textColor} flex items-center gap-1 transition-colors duration-500`}
        >
          Daniel Vale<span className="text-[#FF6321]">.</span>
        </a>
      </div>

      {/* Center Menu */}
      <div className="hidden md:flex flex-none gap-8 items-center group/menu pointer-events-auto">
        {(
          [
            { label: "Work", id: "trabalhos" },
            { label: "Sobre", path: "/sobre" },
            { label: "Contato", path: "/contato" }
          ] as Array<{ label: string; id?: string; path?: string }>
        ).map((item) => (
          <a
            key={item.label}
            href={item.path || `#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              if (item.path) {
                navigate(item.path);
              } else if (item.id) {
                handleNavClick(e, item.id);
              }
            }}
            className={`text-[15px] font-medium ${textColor} transition-all duration-300 group-hover/menu:opacity-30 hover:!opacity-100`}
          >
            {item.label}
          </a>
        ))}
      </div>
      
      {/* Right Button & Mobile Menu Toggle */}
      <div className="flex-1 flex justify-end items-center gap-2 sm:gap-3 pointer-events-auto">
        <motion.a 
          href={`https://wa.me/5532998288650?text=${encodeURIComponent("Olá Daniel! Gostaria de solicitar um orçamento para um projeto.")}`}
          target="_blank" 
          rel="noreferrer" 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative group inline-flex items-center justify-center h-10 px-3.5 sm:px-5 rounded-xl text-white text-[12px] sm:text-[13px] font-medium overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-500 whitespace-nowrap ${isDarkSection ? 'border border-white/20' : 'border border-transparent'}`}
        >
          {/* Base Background (Black) */}
          <div className="absolute inset-0 bg-black transition-opacity duration-500 group-hover:opacity-0" />

          {/* Hover Gradient Sweep (WhatsApp Emerald) */}
          <div className="absolute inset-[-1px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#25D366] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
          </div>

          {/* Text */}
          <span className="relative z-10 font-medium">Solicitar orçamento</span>
        </motion.a>

        {/* Botão de Três Linhas (Somente as Linhas, sem retângulo de fundo) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`md:hidden h-10 px-1 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 bg-transparent border-0 outline-none hover:opacity-75 active:scale-95 ${textColor}`}
          aria-label="Abrir menu de navegação"
          title="Menu"
        >
          <Menu size={26} strokeWidth={2.4} />
        </button>
      </div>

      {/* Drawer do Menu Mobile (Somente no Mobile) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] pointer-events-auto"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white text-black z-[999] shadow-2xl flex flex-col justify-between p-6 pointer-events-auto overflow-y-auto"
            >
              {/* Top Section */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <span className="text-[20px] font-bold tracking-tight text-black">
                    Daniel Vale<span className="text-[#FF6321]">.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
                    aria-label="Fechar menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="py-6 flex flex-col gap-2">
                  <a
                    href="/#trabalhos"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      handleNavClick(e, "trabalhos");
                    }}
                    className="flex items-center justify-between py-3.5 px-4 rounded-2xl text-[16px] font-bold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <span>Trabalhos</span>
                    <ArrowRight size={18} className="text-gray-400" />
                  </a>

                  <a
                    href="/sobre"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      navigate("/sobre");
                    }}
                    className="flex items-center justify-between py-3.5 px-4 rounded-2xl text-[16px] font-bold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <span>Sobre</span>
                    <ArrowRight size={18} className="text-gray-400" />
                  </a>

                  <a
                    href="/contato"
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      navigate("/contato");
                    }}
                    className="flex items-center justify-between py-3.5 px-4 rounded-2xl text-[16px] font-bold text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <span>Contato</span>
                    <ArrowRight size={18} className="text-gray-400" />
                  </a>
                </nav>

                {/* WhatsApp Button */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/5532998288650?text=${encodeURIComponent("Olá Daniel! Gostaria de solicitar um orçamento para um projeto.")}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] text-white font-bold text-[14px] shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
                  >
                    <MessageSquare size={18} />
                    <span>Solicitar orçamento</span>
                  </a>
                </div>
              </div>

              {/* Bottom Contacts */}
              <div className="pt-6 border-t border-gray-100 space-y-3.5 text-xs text-gray-600">
                <a 
                  href="https://instagram.com/danielvaleweb" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-black font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <Instagram size={16} />
                  </div>
                  <span>@danielvaleweb</span>
                </a>

                <a 
                  href="tel:+5532998288650" 
                  className="flex items-center gap-3 text-gray-700 hover:text-black font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <Phone size={16} />
                  </div>
                  <span>+55 32 99828-8650</span>
                </a>

                <a 
                  href="mailto:contato@danielvale.com.br" 
                  className="flex items-center gap-3 text-gray-700 hover:text-black font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <Mail size={16} />
                  </div>
                  <span className="truncate">contato@danielvale.com.br</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
