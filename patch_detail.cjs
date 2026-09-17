const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// Add import
if (!content.includes('CustomVideoPlayer')) {
    content = content.replace(
        'import { motion, AnimatePresence } from "motion/react";',
        `import { motion, AnimatePresence } from "motion/react";\nimport CustomVideoPlayer from "../components/CustomVideoPlayer";`
    );
}

// Remove the focus mode background and the isPlaying toggle
// Wait, currently isPlaying controls a cinema mode backdrop.
const backdropSearch = `            {/* Cinema/Focus Mode Page-Darkening Backdrop Overlay (placed here as a sibling of the video container to guarantee stacking order) */}
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

if (content.includes(backdropSearch)) {
    content = content.replace(backdropSearch, '');
}

// Replace the video/iframe with CustomVideoPlayer or iframe
// Current logic:
/*
              ) : isEmbed ? (
                <iframe
...
                />
              ) : (
                <video
                  src={project.videoUrl}
...
                />
              )}
*/
const videoRenderSearch = `              ) : isEmbed ? (
                <iframe
                  key={project.videoUrl}
                  src={getEmbedUrl(project.videoUrl)}
                  title={project.title}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={project.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>`;

const videoRenderReplace = `              ) : isEmbed ? (
                <iframe
                  key={project.videoUrl}
                  src={getEmbedUrl(project.videoUrl)}
                  title={project.title}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 w-full h-full">
                  <CustomVideoPlayer 
                    src={project.videoUrl} 
                    title={project.title} 
                    poster={project.thumbnail} 
                  />
                </div>
              )}
            </motion.div>`;

if (content.includes(videoRenderSearch)) {
    content = content.replace(videoRenderSearch, videoRenderReplace);
}

// Also remove `onClick={() => setIsPlaying(true)}` from the thumbnail button
const thumbnailBtnSearch = `              {/* Click overlay to play */}
              <button 
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 w-full h-full bg-black/20 hover:bg-black/10 transition-colors group z-10 flex items-center justify-center cursor-pointer"
              >`;
const thumbnailBtnReplace = `              {/* Click overlay to play */}
              <button 
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 w-full h-full bg-black/20 hover:bg-black/10 transition-colors group z-10 flex items-center justify-center cursor-pointer"
              >`;
// Keep setIsPlaying(true) so it hides thumbnail and shows the video player!
// The backdrop overlay was removed so it won't go focus mode.

// Let's modify the video container `z-index` so it doesn't pop out like focus mode if it was doing that.
// The container has `z-[110]` when `isPlaying`.
const containerSearch = `            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isPlaying ? 1.02 : 1
              }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              className={\`relative w-full aspect-video bg-neutral-100 rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/50 \${isPlaying ? 'z-[110] shadow-[0_0_50px_rgba(0,0,0,0.3)]' : 'z-10'}\`}
            >`;
const containerReplace = `            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
              }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              className="relative w-full aspect-video bg-neutral-100 rounded-3xl overflow-hidden shadow-lg border border-neutral-200/50 z-10"
            >`;

content = content.replace(containerSearch, containerReplace);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

