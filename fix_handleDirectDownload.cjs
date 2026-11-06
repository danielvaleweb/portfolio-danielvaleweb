const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const oldFuncRegex = /const handleDirectDownload = async \(url: string\) => \{[\s\S]*?window\.open\(url, '_blank'\);\n    \}\n  \};/;

const newFunc = `const handleDirectDownload = async (url: string) => {
    if (!url) return;
    setIsDownloading(true);
    try {
      // Fetch the file as a blob to force download
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      
      let filename = 'download';
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const parts = pathname.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart) {
          filename = decodeURIComponent(lastPart).split('?')[0]; // clean up query params
        }
      } catch (e) {}
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Fetch falhou, usando fallback com URL direta:", err);
      // Fallback fallback: just try to open or use hidden iframe
      const a = document.createElement('a');
      a.href = url;
      a.download = 'download';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
      setShowDownloadModal(false);
      setDownloadCodeInput('');
    }
  };`;

content = content.replace(oldFuncRegex, newFunc);
fs.writeFileSync('src/pages/ProjectDetail.tsx', content, 'utf8');
