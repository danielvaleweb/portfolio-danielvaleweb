const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// 1. Add state for the modal
const stateInsertPoint = 'const [project, setProject] = useState<Project | null>(null);';
const statesToAdd = `  const [project, setProject] = useState<Project | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadCodeInput, setDownloadCodeInput] = useState('');
  const [downloadError, setDownloadError] = useState('');`;

content = content.replace(stateInsertPoint, statesToAdd);

// 2. Remove from left column
const downloadBlockStart = `            {/* Google Drive / Download Buttons under video */}`;
const downloadBlockEnd = `          {/* Right Column: Bio + Client Review (Lg: col-span-4) */}`;
const downloadBlockIndex = content.indexOf(downloadBlockStart);
const rightColumnIndex = content.indexOf(downloadBlockEnd);

if (downloadBlockIndex !== -1 && rightColumnIndex !== -1) {
  content = content.substring(0, downloadBlockIndex) + '          </div>\n\n' + content.substring(rightColumnIndex);
}

// 3. Add to right column
const rightColumnStart = `          {/* Right Column: Bio + Client Review (Lg: col-span-4) */}
          <div className="lg:col-span-4 space-y-8">`;

const rightColumnDownload = `          {/* Right Column: Bio + Client Review (Lg: col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Download Card */}
            {project.downloadUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-neutral-200/60 shadow-sm"
              >
                <div>
                  <h4 className="font-bold text-neutral-800 text-sm">Arquivo em Alta Resolução</h4>
                  <p className="text-xs text-neutral-400 font-light mt-1 leading-relaxed">Clique no botão abaixo para acessar a pasta do Google Drive e baixar.</p>
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
            
content = content.replace(rightColumnStart, rightColumnDownload);

// 4. Add the modal at the very end of the return statement
const endOfReturn = `    </div>
  );
}`;
const modalMarkup = `      {/* Download Code Modal */}
      <AnimatePresence>
        {showDownloadModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="absolute top-6 right-6 text-neutral-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-6">
                <Download size={20} className="text-neutral-800" />
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Código de Acesso</h3>
              <p className="text-sm text-neutral-500 mb-6">Este projeto é protegido. Insira o código de download para acessar os arquivos em alta resolução.</p>
              
              <div className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    value={downloadCodeInput}
                    onChange={(e) => {
                      setDownloadCodeInput(e.target.value.toUpperCase());
                      setDownloadError('');
                    }}
                    placeholder="DIGITE O CÓDIGO"
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl px-4 py-3.5 focus:outline-none focus:border-neutral-400 focus:bg-white transition-colors text-center font-mono font-bold tracking-widest uppercase"
                    autoFocus
                  />
                  {downloadError && (
                    <p className="text-red-500 text-xs font-semibold mt-2 text-center">{downloadError}</p>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    if (downloadCodeInput === project.downloadCode) {
                      window.open(project.downloadUrl, '_blank');
                      setShowDownloadModal(false);
                    } else {
                      setDownloadError('Código de acesso incorreto. Tente novamente.');
                    }
                  }}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl transition-colors"
                >
                  Acessar Arquivos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}`;

content = content.replace(endOfReturn, modalMarkup);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);
