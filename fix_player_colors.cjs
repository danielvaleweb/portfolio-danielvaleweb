const fs = require('fs');

let content = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

// The user wants an Instagram gradient instead of solid red.
// Instagram gradient is typically a mix of purple, pink, orange, yellow.
// CSS: bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888]
const igGradient = 'bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]';

// Replace bg-[#ff0000] with Instagram gradient for both progress bar and volume bar
content = content.replace(/bg-\[\#ff0000\]/g, igGradient);

// The comment icon is currently:
// <button className="text-white hover:text-gray-300 transition-colors cursor-pointer group relative" title="Comentar">
//   <MessageSquare size={20} />
// </button>
// It does nothing on click. Let's add an alert.
const commentSearch = `<button className="text-white hover:text-gray-300 transition-colors cursor-pointer group relative" title="Comentar">
              <MessageSquare size={20} />
            </button>`;
const commentReplace = `<button onClick={() => alert('Em breve! O sistema de comentários estará disponível na próxima atualização.')} className="text-white hover:text-gray-300 transition-colors cursor-pointer group relative" title="Comentar">
              <MessageSquare size={20} />
            </button>`;
content = content.replace(commentSearch, commentReplace);

// The user mentioned icons are misaligned. Let's look at the bottom controls structure.
// <div className="flex items-center justify-between">
//   <div className="flex items-center gap-4">
//     [play/pause] [skip-10] [skip+10] 
//     <div className="flex items-center gap-2 group/vol"> [mute] [volume bar] </div>
//   </div>
//   <div className="flex-1 text-center truncate px-4"> [title] </div>
//   <div className="flex items-center gap-4">
//     [comment] [settings] [fullscreen]
//   </div>
// </div>

// To align them perfectly, we'll ensure `flex items-center` is consistently applied.
// The Settings dropdown menu might be throwing off the alignment because it is `relative` and might be taking up space or acting weirdly.
// Actually, `flex items-center gap-4` is standard. Let's check the volume slider alignment.

const volBarSearch = `className="relative w-16 h-1 bg-white/30 rounded-full cursor-pointer hidden sm:block opacity-0 group-hover/vol:opacity-100 transition-opacity group/volbar"`;
// Make sure it's vertically centered. It's inside a flex items-center gap-2. 
const volBarReplace = `className="relative w-16 h-1 bg-white/30 rounded-full cursor-pointer hidden sm:block opacity-0 group-hover/vol:opacity-100 transition-opacity group/volbar ml-2 mt-0.5"`;
content = content.replace(volBarSearch, volBarReplace);

const settingsContainerSearch = `<div className="relative group/settings">
              <button className="text-white hover:text-gray-300 transition-colors cursor-pointer" title="Velocidade de Reprodução">
                <Settings size={20} />
              </button>`;
const settingsContainerReplace = `<div className="relative group/settings flex items-center">
              <button className="text-white hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center" title="Velocidade de Reprodução">
                <Settings size={20} />
              </button>`;
content = content.replace(settingsContainerSearch, settingsContainerReplace);

const fullscreenSearch = `<button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors cursor-pointer">
              <Maximize size={20} />
            </button>`;
const fullscreenReplace = `<button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center">
              <Maximize size={20} />
            </button>`;
content = content.replace(fullscreenSearch, fullscreenReplace);

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', content);

