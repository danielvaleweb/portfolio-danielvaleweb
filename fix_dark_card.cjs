const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Replace the grid card UI with the exact dark theme matching the screenshot
const oldGridReturn = `    return (
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

const newDarkGridReturn = `    return (
    <div onClick={handleCardClick} className={\`bg-[#161616] border \${isSelected ? 'border-white' : 'border-[#222]'} rounded-[24px] p-4 flex flex-col relative hover:bg-[#1c1c1c] transition-colors cursor-pointer group shadow-sm\`}>
      
      {/* Thumbnail area */}
      <div className="w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden bg-[#222] relative">
        <img 
           src={project.thumbnail} 
           alt={project.title} 
           className="w-full h-full object-cover" 
           referrerPolicy="no-referrer" 
        />
        
        {/* Menu overlay inside image if needed, or we can put it outside. The design shows no menu on image, but a clean image */}
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col flex-1 px-1">
        <h3 className="text-[14px] font-bold text-white mb-3 leading-tight truncate">{project.title}</h3>
        
        {/* Labels/Tags Row (Blue and Green pills) */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1.5 rounded-full bg-[#1e293b]/60 text-[#60a5fa] text-[10px] font-semibold border border-[#334155]">
            {project.category || 'Label 1'}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#14532d]/60 text-[#4ade80] text-[10px] font-semibold border border-[#166534]">
            {project.status === 'completed' ? 'Done' : 'Label 2'}
          </span>
        </div>

        {/* Bottom Bar Icons */}
        <div className="mt-auto flex items-center justify-between controls">
          {/* Left stats/icons (Check, Link/Paperclip, Document) */}
          <div className="flex items-center gap-3 text-[#888]">
            <div className="flex items-center gap-1" title="Tarefas Concluídas">
              <Check size={14} strokeWidth={2.5} />
              <span className="text-[12px] font-bold">1</span>
            </div>
            <div className="flex items-center gap-1" title="Anexos">
              <Link size={14} strokeWidth={2.5} />
              <span className="text-[12px] font-bold">1</span>
            </div>
            <div className="flex items-center gap-1" title="Notas">
              <FileText size={14} strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Right actions (Dark round buttons) */}
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={onToggleFavorite}
              className={\`w-7 h-7 rounded-full flex items-center justify-center transition-colors \${isFavorite ? 'bg-[#333] text-[#eab308]' : 'bg-[#222] text-[#888] hover:bg-[#333] hover:text-[#ccc]'}\`}
            >
              <Star size={12} className={isFavorite ? "fill-current" : ""} />
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 rounded-full bg-[#222] text-[#888] hover:bg-[#333] hover:text-[#ccc] flex items-center justify-center transition-colors"
            >
              <MoreHorizontal size={12} strokeWidth={3} />
            </button>
            
            {showMenu && (
               <div className="absolute right-0 bottom-10 w-48 bg-[#222] border border-[#333] rounded-xl shadow-lg py-1 z-[60] controls">
                 <button onClick={() => { setShowMenu(false); onActionClick?.('review', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-[#ccc] hover:bg-[#333] transition-colors">Gerar link de avaliação</button>
                 <button onClick={() => { setShowMenu(false); onActionClick?.('download', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-[#ccc] hover:bg-[#333] transition-colors">Gerar código de download</button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );`;

// The sed patch earlier might have missed because of exact spacing. 
// Let's use substring replacement from `return (` after `if (viewMode === 'list') { ... }`
const listEndMarker = '    );\n  }\n\n';
const listEndIndex = content.indexOf(listEndMarker);

if (listEndIndex !== -1) {
  const beforeReturn = content.substring(0, listEndIndex + listEndMarker.length);
  // Find the end of the component
  let remaining = content.substring(listEndIndex + listEndMarker.length);
  const endMarker = '\n  );\n};\n';
  const nextComponentIndex = remaining.indexOf(endMarker);
  
  if (nextComponentIndex !== -1) {
    const afterComponent = remaining.substring(nextComponentIndex + endMarker.length);
    content = beforeReturn + newDarkGridReturn + '\n};\n' + afterComponent;
  }
}

fs.writeFileSync('src/pages/Admin.tsx', content);
