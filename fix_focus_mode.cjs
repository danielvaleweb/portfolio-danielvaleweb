const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// The image showed a focus mode overlay that I missed earlier, or someone re-added it.
// Let's remove this exact block completely so it never shows the dark backdrop.

const focusModeBackdropSearch = `            {/* Cinema/Focus Mode Page-Darkening Backdrop Overlay (placed here as a sibling of the video container to guarantee stacking order) */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed inset-0 z-[100] bg-neutral-950/85 backdrop-blur-sm pointer-events-auto cursor-pointer flex items-end justify-center pb-8 md:pb-12"
                  onClick={() => setIsPlaying(false)}
                >
                  <span className="text-white/50 text-sm font-medium tracking-widest uppercase">
                    Clique em qualquer lugar para sair
                  </span>
                </motion.div>
              )}
            </AnimatePresence>`;

if (content.includes(focusModeBackdropSearch)) {
    content = content.replace(focusModeBackdropSearch, '');
} else {
    // If it's slightly different:
    const focusFallback = /\{\/\* Cinema\/Focus Mode.*?<\/AnimatePresence>/s;
    content = content.replace(focusFallback, '');
}

// Ensure the container doesn't have z-[110]
const containerSearch = 'className={`relative w-full aspect-square md:aspect-video lg:aspect-square bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/40 z-0 transition-all duration-300`}';
const containerReplace = 'className={`relative w-full aspect-square md:aspect-video lg:aspect-square bg-black rounded-3xl overflow-hidden shadow-lg border border-neutral-200/40 z-10 transition-all duration-300`}';

if (content.includes(containerSearch)) {
    content = content.replace(containerSearch, containerReplace);
}

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

