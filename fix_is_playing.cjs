const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const classSearch = 'className={`relative w-full ${isVertical ? \'max-w-md mx-auto aspect-[9/16]\' : \'aspect-video\'} bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/40 ${isPlaying ? \'z-[110] shadow-[0_0_100px_rgba(0,0,0,0.95)] scale-[1.02]\' : \'z-0\'} transition-all duration-300`}';
const classReplace = 'className={`relative w-full ${isVertical ? \'max-w-md mx-auto aspect-[9/16]\' : \'aspect-video\'} bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/40 z-0 transition-all duration-300`}';

content = content.replace(classSearch, classReplace);

// Another place:
const colSearch = 'className={`lg:col-span-8 space-y-6 relative ${isPlaying ? \'z-[100]\' : \'z-0\'}`}';
const colReplace = 'className={`lg:col-span-8 space-y-6 relative z-0`}';
content = content.replace(colSearch, colReplace);

// Another place:
const pxSearch = 'className={`max-w-7xl mx-auto px-6 pt-32 relative ${isPlaying ? \'z-auto\' : \'z-10\'}`}';
const pxReplace = 'className={`max-w-7xl mx-auto px-6 pt-32 relative z-10`}';
content = content.replace(pxSearch, pxReplace);

// Finally, we don't need body locking
const bodyLock = `  // Lock body scroll when playing video
  useEffect(() => {
    if (isPlaying) {
      document.body.classList.add('video-playing');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('video-playing');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('video-playing');
      document.body.style.overflow = '';
    };
  }, [isPlaying]);`;

if (content.includes(bodyLock)) {
  content = content.replace(bodyLock, '');
}

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

