const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// 1. Remove the old download card
const oldDlCardSearch = `            {/* Download Card */}
            {project.downloadUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-[#111111] border border-neutral-800 p-6 rounded-3xl shadow-lg mt-6"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">Arquivo em Alta Resolução</h4>
                  <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">Clique no botão ao lado para baixar os arquivos do projeto.</p>
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
                  className="w-full xl:w-auto bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-[0.1em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Lock size={15} className="mr-1" />
                  Download
                </button>
              </motion.div>
            )}`;

if (content.includes(oldDlCardSearch)) {
    content = content.replace(oldDlCardSearch, '');
} else {
    console.log("Could not find exact old download card to remove, trying regex.");
    const regex = /\{\/\* Download Card \*\/\}[\s\S]*?\n\s*\)\}/;
    content = content.replace(regex, '');
}

// 2. Insert new download card after evaluation card
const targetSearch = `              </motion.div>
            )}

          </div>

        </div>`;

const newDlCard = `              </motion.div>
            )}

            {/* Download Card (Right Column) */}
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
            )}

          </div>

        </div>`;

content = content.replace(targetSearch, newDlCard);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

