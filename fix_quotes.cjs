const fs = require('fs');
let content = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

// The file literally contains \`\${h}...\`
// Let's replace the literal \` with ` and \${ with ${

content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', content);
