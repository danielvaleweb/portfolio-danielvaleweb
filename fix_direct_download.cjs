const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const downloadFunc = `
  const handleDirectDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      const filename = url.split('/').pop() || 'download';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (err) {
      // Fallback if CORS prevents fetch
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      a.target = '_self'; // try to download in same tab if possible, or _blank
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleAddComment = (text: string) => {`;

content = content.replace('  const handleAddComment = (text: string) => {', downloadFunc);

const directDlSearch = `window.open(project.downloadUrl, '_blank');`;
content = content.replace(/window\.open\(project\.downloadUrl,\s*'_blank'\);/g, 'handleDirectDownload(project.downloadUrl);');


fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

