const fs = require('fs');

let content = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

const oldVolInputSearch = `{/* Volume Slider - shows on hover for desktop but we can keep it simple */}
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-white bg-white/30 rounded-full appearance-none cursor-pointer outline-none hidden sm:block opacity-0 group-hover/vol:opacity-100 transition-opacity"
              />`;

const customVolumeSliderStr = `{/* Custom Volume Slider */}
              <div 
                className="relative w-16 h-1 bg-white/30 rounded-full cursor-pointer hidden sm:block opacity-0 group-hover/vol:opacity-100 transition-opacity group/volbar ml-2 mt-0.5"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  // We need to call the handleVolumeChange logic, or inline it
                  const syntheticEvent = { target: { value: pos.toString() } } as React.ChangeEvent<HTMLInputElement>;
                  handleVolumeChange(syntheticEvent);
                }}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full pointer-events-none"
                  style={{ width: \`\${(isMuted ? 0 : volume) * 100}%\` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full transform scale-0 group-hover/volbar:scale-100 transition-transform shadow-sm"></div>
                </div>
              </div>`;

content = content.replace(oldVolInputSearch, customVolumeSliderStr);

// Make sure the progress thumb is white so it matches the image
const progressThumbSearch = 'w-3 h-3 bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full transform scale-0 group-hover/progress:scale-100';
const progressThumbReplace = 'w-3 h-3 bg-white rounded-full transform scale-0 group-hover/progress:scale-100';
content = content.replace(progressThumbSearch, progressThumbReplace);

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', content);

