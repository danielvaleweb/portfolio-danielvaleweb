const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// 1. Move Download Card to the bottom of the right column
const rightColumnStart = '          <div className="lg:col-span-4 space-y-6">';
const downloadCardCode = `            {/* Download Card */}
            {project.downloadUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm"
              >
                <div>
                  <h4 className="font-bold text-neutral-800 text-sm">Arquivo em Alta Resolução</h4>
                  <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">Clique no botão ao lado para acessar a pasta do Google Drive e baixar.</p>
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
                  className="w-full bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download size={15} />
                  Download
                </button>
              </motion.div>
            )}`;

content = content.replace(downloadCardCode, ''); // Remove from top

// Insert at the bottom of right column
const rightColumnEndSearch = '          </div>\n        </div>\n      </div>\n\n      {/* Download Code Modal */}';
const rightColumnEndReplace = `\n${downloadCardCode}\n          </div>\n        </div>\n      </div>\n\n      {/* Download Code Modal */}`;

content = content.replace(rightColumnEndSearch, rightColumnEndReplace);


// 2. Make video thumbnail square
// Currently it's aspect-[4/3] or aspect-video depending on things. Let's find the video container.
const videoContainerSearch = 'className="relative w-full aspect-video bg-neutral-100 rounded-3xl overflow-hidden shadow-lg border border-neutral-200/50 z-10"';
// Looking at the code in the grep, it might be:
const videoContainerSearch2 = 'className={`relative w-full ${isVertical ? \'max-w-md mx-auto aspect-[9/16]\' : \'aspect-video\'} bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/40 z-0 transition-all duration-300`}';

if (content.includes(videoContainerSearch2)) {
    const videoContainerReplace = 'className={`relative w-full aspect-square md:aspect-video lg:aspect-square bg-black rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-200/40 z-0 transition-all duration-300`}';
    content = content.replace(videoContainerSearch2, videoContainerReplace);
}

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

