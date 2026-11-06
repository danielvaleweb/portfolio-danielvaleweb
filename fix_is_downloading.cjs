const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

content = content.replace(
  "const [downloadError, setDownloadError] = useState('');",
  "const [downloadError, setDownloadError] = useState('');\n  const [isDownloading, setIsDownloading] = useState(false);"
);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content, 'utf8');
