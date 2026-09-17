const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const targetSearch = `                   <p className="text-[11px] text-gray-500 dark:text-[#888] font-bold uppercase mb-2">Código Gerado</p>
                   <p className="text-3xl text-gray-900 dark:text-white font-mono font-black tracking-[0.2em]">
                     {actionProject.downloadCode || 'N/A'}
                   </p>`;

const targetReplace = `                   <p className="text-[11px] text-gray-500 dark:text-[#888] font-bold uppercase mb-2">Código Gerado</p>
                   <div className="flex items-center justify-center gap-3">
                     <p className="text-3xl bg-[#1e3a8a] text-white px-4 py-1 rounded shadow-sm font-mono font-black tracking-[0.2em]">
                       {actionProject.downloadCode || 'N/A'}
                     </p>
                     {actionProject.downloadCode && (
                       <button 
                         onClick={() => {
                           navigator.clipboard.writeText(actionProject.downloadCode);
                           // Basic feedback, could be a toast but alert is fine for now
                           alert('Código copiado com sucesso!');
                         }}
                         className="text-gray-400 hover:text-white transition-colors p-2 cursor-pointer bg-gray-200 dark:bg-[#222] rounded-full hover:bg-gray-300 dark:hover:bg-[#333]"
                         title="Copiar Código"
                       >
                         <Copy size={18} />
                       </button>
                     )}
                   </div>`;

content = content.replace(targetSearch, targetReplace);

fs.writeFileSync('src/pages/Admin.tsx', content);

