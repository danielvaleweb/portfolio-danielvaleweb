const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Replace the grid view card component return structure
const oldGridReturn = `    return (
    <div onClick={handleCardClick} className={\`bg-white dark:bg-[#111111] border \${isSelected ? 'border-black dark:border-white' : 'border-gray-200 dark:border-[#1f1f1f]'} rounded-3xl p-6 flex flex-col items-center relative hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors cursor-pointer group shadow-sm\`}>
      <div className="absolute top-5 left-5 flex items-center gap-3 controls">
        <button 
          onClick={onToggleSelect}
          className={\`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-colors \${isSelected ? 'bg-black border-black dark:bg-white dark:border-white' : 'border-gray-300 dark:border-[#333] group-hover:border-gray-400 dark:group-hover:border-[#555]'}\`}
        >
          {isSelected && <Check size={12} className="text-white dark:text-black" strokeWidth={4} />}
        </button>
        <button onClick={onToggleFavorite}>
          <Star size={16} className={\`\${isFavorite ? 'fill-[#EAB308] text-[#EAB308]' : 'text-gray-400 dark:text-[#555] group-hover:text-gray-600 dark:group-hover:text-[#777]'} transition-colors\`} />
        </button>
      </div>
      
      <div className="absolute top-5 right-5 text-gray-400 dark:text-[#555] group-hover:text-gray-600 dark:group-hover:text-[#777] transition-colors controls">
        <button onClick={() => setShowMenu(!showMenu)}>
          <MoreHorizontal size={20} />
        </button>
        {showMenu && (
           <div className="absolute right-0 top-6 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg py-1 z-[60]">
             <button onClick={() => { setShowMenu(false); onActionClick?.('review', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar link de avaliação</button>
             <button onClick={() => { setShowMenu(false); onActionClick?.('download', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar código de download</button>
           </div>
        )}
      </div>
      
      <div className="w-20 h-20 mt-8 mb-6 flex items-center justify-center rounded-2xl overflow-hidden shadow-inner bg-gray-100 dark:bg-[#1a1a1a]">
        {logo}
      </div>
      
      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-1.5 text-center leading-tight">{project.title}</h3>
      <p className="text-[13px] text-gray-500 dark:text-[#777] text-center font-medium">{project.category}</p>
    </div>
  );`;

const newGridReturn = `    return (
    <div onClick={handleCardClick} className={\`bg-white dark:bg-[#111111] border \${isSelected ? 'border-black dark:border-white' : 'border-gray-200 dark:border-[#222]'} rounded-3xl p-5 flex flex-col relative hover:bg-gray-50 dark:hover:bg-[#161616] transition-colors cursor-pointer group shadow-sm\`}>
      
      {/* Thumbnail area mimicking the image reference */}
      <div className="w-full aspect-[4/3] mb-5 rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a] relative border border-gray-100 dark:border-[#222]">
        <img 
           src={project.thumbnail} 
           alt={project.title} 
           className="w-full h-full object-cover" 
           referrerPolicy="no-referrer" 
        />
        
        {/* Top actions absolute inside the image container */}
        <div className="absolute top-3 right-3 text-white transition-colors controls flex gap-2">
          <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {showMenu && (
           <div className="absolute right-3 top-12 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl shadow-lg py-1 z-[60] controls">
             <button onClick={() => { setShowMenu(false); onActionClick?.('review', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar link de avaliação</button>
             <button onClick={() => { setShowMenu(false); onActionClick?.('download', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-gray-700 dark:text-[#ccc] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">Gerar código de download</button>
           </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col flex-1 px-1">
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-3 leading-tight">{project.title}</h3>
        
        {/* Labels/Tags Row */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-full bg-[#1e293b]/10 dark:bg-[#1e293b] text-[#334155] dark:text-[#94a3b8] text-[11px] font-bold border border-[#cbd5e1]/50 dark:border-[#334155]">
            {project.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#14532d]/10 dark:bg-[#14532d] text-[#166534] dark:text-[#86efac] text-[11px] font-bold border border-[#bbf7d0]/50 dark:border-[#166534]">
            {project.status === 'completed' ? 'Finalizado' : 'Em andamento'}
          </span>
        </div>

        {/* Bottom Bar Icons */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-[#222] flex items-center justify-between controls">
          {/* Left stats/icons */}
          <div className="flex items-center gap-4 text-gray-400 dark:text-[#555]">
            <div className="flex items-center gap-1.5" title="Arquivos">
              <Cloud size={16} />
              <span className="text-[12px] font-bold">1</span>
            </div>
            <div className="flex items-center gap-1.5" title="Notas">
              <FileText size={16} />
              <span className="text-[12px] font-bold">1</span>
            </div>
            <div className="flex items-center gap-1.5" title="Avaliações">
              <Check size={16} />
              <span className="text-[12px] font-bold">1</span>
            </div>
          </div>
          
          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleSelect}
              className={\`w-8 h-8 rounded-full flex items-center justify-center transition-colors \${isSelected ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 hover:text-black dark:text-[#666] dark:hover:text-white'}\`}
            >
              <Check size={14} strokeWidth={3} />
            </button>
            <button 
              onClick={onToggleFavorite}
              className={\`w-8 h-8 rounded-full flex items-center justify-center transition-colors \${isFavorite ? 'bg-[#fef08a]/20 text-[#eab308]' : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-400 hover:text-black dark:text-[#666] dark:hover:text-white'}\`}
            >
              <Star size={14} className={isFavorite ? "fill-current" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );`;

content = content.replace(oldGridReturn, newGridReturn);

fs.writeFileSync('src/pages/Admin.tsx', content);
