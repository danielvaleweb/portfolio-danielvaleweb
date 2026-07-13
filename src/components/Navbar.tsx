import { motion, useScroll, useTransform } from "motion/react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkSection, setIsDarkSection] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 50);
      
      // Check if we are over a dark section
      const darkSectionIds = ['processo'];
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

  const textColor = isMobile || isDarkSection ? "text-white" : "text-black";
  const textColorMuted = isMobile || isDarkSection ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black";

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
      
      {/* Right Button */}
      <div className="flex-1 flex justify-end items-center pointer-events-auto">
        <motion.a 
          href="https://instagram.com/danielvaleweb" 
          target="_blank" 
          rel="noreferrer" 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative group inline-flex items-center justify-center h-10 px-6 rounded-xl text-white text-[13px] font-medium overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all duration-500 ${isDarkSection ? 'border border-white/20' : 'border border-transparent'}`}
        >
          {/* Base Background (Black) */}
          <div className="absolute inset-0 bg-black transition-opacity duration-500 group-hover:opacity-0" />

          {/* Instagram Gradient Sweep */}
          <div className="absolute inset-[-1px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
          </div>

          {/* Text */}
          <span className="relative z-10">Instagram.</span>
        </motion.a>
      </div>
    </motion.nav>
  );
}
