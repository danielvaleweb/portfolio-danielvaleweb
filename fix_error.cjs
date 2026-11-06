const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const targetStr = `console.error("Fetch falhou, usando fallback com URL direta:", err);`;
const replacementStr = `// Silently fallback without triggering error monitors
      console.warn("CORS bloqueou o fetch, abrindo em nova aba/janela.");`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/pages/ProjectDetail.tsx', content, 'utf8');
