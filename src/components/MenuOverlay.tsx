import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "HOME", href: "#home" },
  { label: "STUDIO", href: "#studio" },
  { label: "PROJECTS", href: "#projects" },
  { label: "JOURNALS", href: "#journals" },
  { label: "GALLERY", href: "#gallery" },
];

export function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-black flex flex-col p-8 md:p-16"
        >
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-white text-black px-6 py-2 rounded-full text-[12px] font-bold tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
            >
              CLOSE <X size={14} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 flex flex-col justify-center">
            <nav className="flex flex-col -gap-4 md:-gap-8">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <a
                    href={item.href}
                    onClick={onClose}
                    className="block text-white text-[12vw] md:text-[10vw] font-black leading-[0.85] tracking-tighter hover:italic transition-all duration-300 w-fit"
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* Footer Info */}
          <div className="flex justify-between items-end text-white/40 text-[10px] md:text-[12px] font-medium tracking-widest">
            <div>© 2024 DANIEL VALE</div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">TWITTER</a>
              <a href="#" className="hover:text-white transition-colors">INSTAGRAM</a>
              <a href="#" className="hover:text-white transition-colors">LINKEDIN</a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
