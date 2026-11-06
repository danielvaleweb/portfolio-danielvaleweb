const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const targetBtn = `                <button 
                  onClick={() => {
                    if (downloadCodeInput === project.downloadCode) {
                      handleDirectDownload(project.downloadUrl);
                      setShowDownloadModal(false);
                    } else {
                      setDownloadError('Código de acesso incorreto. Tente novamente.');
                    }
                  }}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl transition-colors"
                >
                  Iniciar Download
                </button>`;

const replacementBtn = `                <button 
                  onClick={() => {
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
                  }}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl transition-colors"
                >
                  Iniciar Download
                </button>`;

content = content.replace(targetBtn, replacementBtn);
fs.writeFileSync('src/pages/ProjectDetail.tsx', content, 'utf8');
