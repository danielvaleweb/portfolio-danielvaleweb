const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const oldBtn = `                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl transition-colors"
                >
                  Iniciar Download
                </button>`;

const newBtn = `                  disabled={isDownloading}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Iniciando download...
                    </>
                  ) : (
                    'Iniciar Download'
                  )}
                </button>`;

content = content.replace(oldBtn, newBtn);

// Also need to adjust the modal close in onClick, because if we hide the modal immediately, the user won't see "Iniciando download...". 
// We moved setShowDownloadModal(false) into handleDirectDownload `finally` block, so we should remove it from the button onClick.
const oldOnClick = `                  onClick={() => {
                    if (downloadCodeInput === project.downloadCode) {
                      if (!project.downloadUrl) {
                        setDownloadError('Link de download indisponível no momento.');
                        return;
                      }
                      handleDirectDownload(project.downloadUrl);
                      setShowDownloadModal(false);
                      setDownloadCodeInput('');
                    } else {
                      setDownloadError('Código de acesso incorreto. Tente novamente.');
                    }
                  }}`;

const newOnClick = `                  onClick={() => {
                    if (downloadCodeInput === project.downloadCode) {
                      if (!project.downloadUrl) {
                        setDownloadError('Link de download indisponível no momento.');
                        return;
                      }
                      handleDirectDownload(project.downloadUrl);
                    } else {
                      setDownloadError('Código de acesso incorreto. Tente novamente.');
                    }
                  }}`;

content = content.replace(oldOnClick, newOnClick);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content, 'utf8');
