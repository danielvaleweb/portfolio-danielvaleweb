const fs = require('fs');

// --- 1. Project Detail Updates ---
let detailContent = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// Ensure LockIcon is imported if needed, we'll use Lock from lucide-react
if (!detailContent.includes('Lock,')) {
    detailContent = detailContent.replace('Download,', 'Download, Lock,');
}

// Update Download button to have a Lock icon
const btnSearch = `<Download size={15} />
                  Download`;
const btnReplace = `<Lock size={15} className="mr-1" />
                  Download`;
detailContent = detailContent.replace(btnSearch, btnReplace);

fs.writeFileSync('src/pages/ProjectDetail.tsx', detailContent);


// --- 2. Custom Video Player Updates ---
let playerContent = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

// Remove Flag icon from imports and usage
playerContent = playerContent.replace('Flag, ', '');
const flagSearch = `<button className="text-white hover:text-gray-300 p-2">
          <Flag size={20} />
        </button>`;
playerContent = playerContent.replace(flagSearch, '');

// Adjust Play/Pause button on the thumbnail (when paused)
// The user says "Ajuste o ícone de play e pause para um mais bonito, esse ta feio e descentralizado"
// In CustomVideoPlayer, it's currently:
// <Play size={36} fill="white" className="ml-2" />
const centerPlaySearch = `<Play size={36} fill="white" className="ml-2" />`;
const centerPlayReplace = `<Play size={40} fill="white" strokeWidth={1.5} className="ml-1" />`; 
// ml-1 is usually better for centering Play icons visually due to the triangle shape.
playerContent = playerContent.replace(centerPlaySearch, centerPlayReplace);

// "coloque o ícone de avançar 10 segundos e retroceder, coloque eles maiores junto com os outros icones"
// Currently they are RotateCcw and RotateCw with absolute text inside.
// Wait, the user wants them bigger.
const bottomControlsSearch = `<button onClick={() => skipTime(-10)} className="text-white hover:text-gray-300 transition-colors relative flex items-center justify-center">
              <RotateCcw size={20} />
              <span className="absolute text-[8px] font-bold mt-0.5">10</span>
            </button>
            <button onClick={() => skipTime(10)} className="text-white hover:text-gray-300 transition-colors relative flex items-center justify-center">
              <RotateCw size={20} />
              <span className="absolute text-[8px] font-bold mt-0.5">10</span>
            </button>`;

const bottomControlsReplace = `<button onClick={() => skipTime(-10)} className="text-white hover:text-gray-300 transition-colors relative flex items-center justify-center">
              <RotateCcw size={24} />
              <span className="absolute text-[9px] font-bold mt-0.5">10</span>
            </button>
            <button onClick={() => skipTime(10)} className="text-white hover:text-gray-300 transition-colors relative flex items-center justify-center">
              <RotateCw size={24} />
              <span className="absolute text-[9px] font-bold mt-0.5">10</span>
            </button>`;
playerContent = playerContent.replace(bottomControlsSearch, bottomControlsReplace);

// "aumente um pouco a altura dessa barra"
// Bottom controls bar is: className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pb-3 ...`}
const barSearch = `className={\`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 pb-3 transition-opacity duration-300 \${showControls ? 'opacity-100' : 'opacity-0'}\`}`;
const barReplace = `className={\`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 pb-6 pt-12 transition-opacity duration-300 \${showControls ? 'opacity-100' : 'opacity-0'}\`}`;
playerContent = playerContent.replace(barSearch, barReplace);

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', playerContent);

