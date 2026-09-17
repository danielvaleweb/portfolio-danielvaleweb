const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Find the grid return block
const gridStartMarker = "  return (\n    <div onClick={handleCardClick} className={`bg-white dark:bg-[#111111]";
const gridStartIndex = content.indexOf(gridStartMarker);

if (gridStartIndex !== -1) {
  // Find the end of the return statement
  const componentEndMarker = "          </div>\n  );\n}\n";
  const nextComponentIndex = content.indexOf(componentEndMarker, gridStartIndex);
  
  if (nextComponentIndex !== -1) {
    const beforeGrid = content.substring(0, gridStartIndex);
    const afterGrid = content.substring(nextComponentIndex + componentEndMarker.length);
    
    const newDarkGridReturn = `  return (
    <div onClick={handleCardClick} className={\`bg-[#161616] border \${isSelected ? 'border-white' : 'border-[#222]'} rounded-[24px] p-4 flex flex-col relative hover:bg-[#1c1c1c] transition-colors cursor-pointer group shadow-sm\`}>
      
      {/* Thumbnail area */}
      <div className="w-full aspect-[4/3] mb-4 rounded-xl overflow-hidden bg-[#222] relative">
        <img 
           src={project.thumbnail} 
           alt={project.title} 
           className="w-full h-full object-cover" 
           referrerPolicy="no-referrer" 
        />
        
        {/* Top actions absolute inside the image container if needed */}
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col flex-1 px-1">
        <h3 className="text-[14px] font-bold text-white mb-3 leading-tight truncate">{project.title}</h3>
        
        {/* Labels/Tags Row */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1.5 rounded-full bg-[#1e293b]/60 text-[#60a5fa] text-[10px] font-semibold border border-[#334155]">
            {project.category || 'Categoria'}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-[#14532d]/60 text-[#4ade80] text-[10px] font-semibold border border-[#166534]">
            {project.status === 'completed' ? 'Done' : 'Em andamento'}
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
              <LinkIcon size={14} strokeWidth={2.5} />
              <span className="text-[12px] font-bold">1</span>
            </div>
            <div className="flex items-center gap-1" title="Notas">
              <FileText size={14} strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Right actions (Dark round buttons) */}
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={onToggleSelect}
              className={\`w-7 h-7 rounded-full flex items-center justify-center transition-colors \${isSelected ? 'bg-white text-black' : 'bg-[#222] text-[#888] hover:bg-[#333] hover:text-[#ccc]'}\`}
            >
              <Check size={12} strokeWidth={3} />
            </button>
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
               <div className="absolute right-0 bottom-10 w-48 bg-[#222] border border-[#333] rounded-xl shadow-lg py-1 z-[60] controls overflow-hidden">
                 <button onClick={() => { setShowMenu(false); onActionClick?.('review', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-[#ccc] hover:bg-[#333] transition-colors">Gerar link de avaliação</button>
                 <button onClick={() => { setShowMenu(false); onActionClick?.('download', project); }} className="w-full text-left px-4 py-2 text-[12px] font-bold text-[#ccc] hover:bg-[#333] transition-colors">Gerar código de download</button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
    content = beforeGrid + newDarkGridReturn + afterGrid;
  }
}

fs.writeFileSync('src/pages/Admin.tsx', content);
