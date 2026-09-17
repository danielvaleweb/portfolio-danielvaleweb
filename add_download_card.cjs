const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const rightColumnEndSearch = '          </div>\n        </div>\n      </div>\n\n      {/* Download Code Modal */}'
const downloadCardCode = `
            {/* Download Card */}
            {project.downloadUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-[#111111] p-6 rounded-3xl border border-neutral-800 shadow-sm mt-6"
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
                      window.open(project.downloadUrl, '_blank');
                    }
                  }}
                  className="w-full xl:w-auto bg-white hover:bg-neutral-200 active:scale-[0.98] text-black text-[11px] font-bold uppercase tracking-[0.1em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  Download
                </button>
              </motion.div>
            )}
`;

if (content.includes(rightColumnEndSearch)) {
    const rightColumnEndReplace = `\n${downloadCardCode}\n          </div>\n        </div>\n      </div>\n\n      {/* Download Code Modal */}`;
    content = content.replace(rightColumnEndSearch, rightColumnEndReplace);
    fs.writeFileSync('src/pages/ProjectDetail.tsx', content);
} else {
    // If it doesn't have the standard right column structure anymore, we'll place it right before the "More projects" or Download Code Modal
    const fallbackSearch = '      {/* Download Code Modal */}';
    if (content.includes(fallbackSearch)) {
         content = content.replace(fallbackSearch, `\n${downloadCardCode}\n      {/* Download Code Modal */}`);
         fs.writeFileSync('src/pages/ProjectDetail.tsx', content);
    }
}
