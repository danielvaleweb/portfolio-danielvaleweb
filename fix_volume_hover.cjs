const fs = require('fs');
let content = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

// The volume bar hover state is buggy. It's inside a `group/vol` and the slider is `group-hover/vol:opacity-100`.
// But when interacting with the slider itself, maybe the cursor is missing the container.
// We can make the container larger or keep the opacity 100 on hover.
// We can also ensure the settings tooltip only opens on click, not hover.

// 1. Tooltip for settings to open on click instead of hover
const settingsSearch = `<div className="relative group/settings flex items-center">
              <button className="text-white hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center" title="Velocidade de Reprodução">
                <Settings size={20} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover/settings:flex flex-col bg-black/90 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 text-xs shadow-xl">`;

const settingsReplace = `
            {/* Velocidade de reprodução onClick */}
            <div className="relative flex items-center">
              <button 
                onClick={(e) => {
                  e.currentTarget.nextElementSibling?.classList.toggle('hidden');
                  e.currentTarget.nextElementSibling?.classList.toggle('flex');
                }} 
                className="text-white hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center" 
                title="Velocidade de Reprodução"
              >
                <Settings size={20} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden flex-col bg-black/90 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 text-xs shadow-xl">`;

content = content.replace(settingsSearch, settingsReplace);

// Let's also make sure to hide the settings when one is clicked
const speedOptionSearch = `onClick={() => { if (videoRef.current) videoRef.current.playbackRate = speed; }}`;
const speedOptionReplace = `onClick={(e) => { 
                    if (videoRef.current) videoRef.current.playbackRate = speed; 
                    e.currentTarget.parentElement?.classList.add('hidden');
                    e.currentTarget.parentElement?.classList.remove('flex');
                  }}`;
content = content.replace(speedOptionSearch, speedOptionReplace);


// 2. Volume slider disappearing.
// It's `hidden sm:block opacity-0 group-hover/vol:opacity-100`
// It's inside `<div className="flex items-center gap-2 group/vol">`
// The `hidden sm:block` means it's invisible on mobile, but on desktop it's `opacity-0` unless `group-hover/vol:opacity-100`.
// If the user is trying to slide the volume, their mouse is ON the volume bar. So the group should still be hovered.
// However, maybe we should just make it fully visible `opacity-100` instead of hiding it on hover? Wait, standard is hiding it.
// Actually, `hidden sm:block` doesn't work well with flex layouts sometimes. Let's make it `hidden sm:flex items-center`.
// Let's just fix the volume slider to be more robust.
// Instead of opacity, we can just use `w-0` to `w-16` or something, but opacity is fine. Let's just remove the `hidden` and make it `sm:opacity-0` or just let it be visible.
// YouTube hides it with width transition. 
// Let's simplify: `className="relative w-16 h-1 bg-white/30 rounded-full cursor-pointer hidden sm:block opacity-0 group-hover/vol:opacity-100 transition-opacity group/volbar ml-2 mt-0.5"`
// If the user says it's buggy, we'll just make it `opacity-0 group-hover/vol:opacity-100` and ensure the container is solid.
// Also, the click event might be triggering something. The problem is `hidden sm:block`. A div inside flex with `block` can be weird.
const volSearch = `className="relative w-16 h-1 bg-white/30 rounded-full cursor-pointer hidden sm:block opacity-0 group-hover/vol:opacity-100 transition-opacity group/volbar ml-2 mt-0.5"`;
const volReplace = `className="relative w-16 h-1 bg-white/30 rounded-full cursor-pointer opacity-0 group-hover/vol:opacity-100 transition-opacity group/volbar ml-2 mt-0.5"`;
content = content.replace(volSearch, volReplace);

// Ensure the group wrapper is wide enough. It's `<div className="flex items-center gap-2 group/vol">`
// Let's make it have a padding so the hover doesn't drop off easily.
const volGroupSearch = `<div className="flex items-center gap-2 group/vol">`;
const volGroupReplace = `<div className="flex items-center gap-2 group/vol py-2 -my-2 pr-2">`;
content = content.replace(volGroupSearch, volGroupReplace);

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', content);

