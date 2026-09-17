const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const search = `            {/* Download Card (Right Column) */}
            {project.downloadUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="relative p-[1.5px] rounded-3xl shadow-lg mt-6 bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
              >
                <div className="flex flex-col gap-5 justify-between items-start bg-[#111111] p-6 rounded-[23px] h-full w-full">
                  <div>
                    <h4 className="font-bold text-white text-sm">Arquivo em Alta Resolução</h4>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">Clique no botão abaixo para baixar os arquivos do projeto.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (project.downloadCode) {
                        setShowDownloadModal(true);
                        setDownloadCodeInput('');
                        setDownloadError('');
                      } else {
                        handleDirectDownload(project.downloadUrl);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-[0.1em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock size={15} className="mr-1" />
                    Download
                  </button>
                </div>
              </motion.div>
            )}`;

const replace = `            {/* Download Card (Right Column) */}
            {project.downloadUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="relative rounded-3xl shadow-lg mt-6 bg-[#111111] overflow-hidden border border-neutral-800/80"
              >
                {/* Accent na quina (Instagram colors) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] opacity-20 blur-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#f9ce34] via-[#ee2a7b] to-transparent opacity-40 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                
                <div className="relative flex flex-col gap-5 justify-between items-start p-6 h-full w-full">
                  <div>
                    <h4 className="font-bold text-white text-sm">Arquivo em Alta Resolução</h4>
                    <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">Clique no botão abaixo para baixar os arquivos do projeto.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (project.downloadCode) {
                        setShowDownloadModal(true);
                        setDownloadCodeInput('');
                        setDownloadError('');
                      } else {
                        handleDirectDownload(project.downloadUrl);
                      }
                    }}
                    className="w-full bg-neutral-900 hover:bg-black active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-[0.1em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-neutral-800"
                  >
                    <Lock size={15} className="mr-1 text-neutral-400" />
                    Download
                  </button>
                </div>
              </motion.div>
            )}`;

if (content.includes('bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]')) {
  content = content.replace(search, replace);
  fs.writeFileSync('src/pages/ProjectDetail.tsx', content);
  console.log("Updated download card styling and position.");
} else {
  console.log("Could not find the exact download card block. Something changed.");
}
