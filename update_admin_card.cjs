const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Update Card Props
content = content.replace(
  'onClick?: () => void\n}) => {',
  `onClick?: () => void,\n  onActionClick?: (action: 'review' | 'download', project: Project) => void\n}) => {\n  const [showMenu, setShowMenu] = useState(false);`
);

// We need to import useState inside Card if we use it, but since Card is not the main component, it's fine. Wait, React is already imported.
// But better to just pass `onMenuClick` from outside, or manage `showMenu` locally. Yes, `const [showMenu, setShowMenu] = useState(false);`

// Replace the MoreHorizontal button in list mode
const listMoreBtn = `<button className="text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#777] transition-colors">\n             <MoreHorizontal size={20} />\n           </button>`;
const newListMoreBtn = `<div className="relative controls">
             <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 dark:text-[#555] hover:text-gray-600 dark:hover:text-[#777] transition-colors">
               <MoreHorizontal size={20} />
             </button>
             {showMenu && (
               <div className="absolute right-0 top-6 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg py-1 z-[60]">
                 <button onClick={() => { setShowMenu(false); onActionClick?.('review', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar link de avaliação</button>
                 <button onClick={() => { setShowMenu(false); onActionClick?.('download', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar código de download</button>
               </div>
             )}
           </div>`;
content = content.replace(listMoreBtn, newListMoreBtn);

// Replace the MoreHorizontal button in grid mode
const gridMoreBtn = `<button>\n          <MoreHorizontal size={20} />\n        </button>`;
const newGridMoreBtn = `<button onClick={() => setShowMenu(!showMenu)}>\n          <MoreHorizontal size={20} />\n        </button>
        {showMenu && (
           <div className="absolute right-0 top-6 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg py-1 z-[60]">
             <button onClick={() => { setShowMenu(false); onActionClick?.('review', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar link de avaliação</button>
             <button onClick={() => { setShowMenu(false); onActionClick?.('download', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar código de download</button>
           </div>
        )}`;
content = content.replace(gridMoreBtn, newGridMoreBtn);

fs.writeFileSync('src/pages/Admin.tsx', content);
