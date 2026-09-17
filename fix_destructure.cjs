const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Fix destructuring
content = content.replace(
  '  onClick\n}: { \n  project: Project,',
  '  onClick,\n  onActionClick\n}: { \n  project: Project,'
);

// Fix imports
if (!content.includes('User,')) {
    content = content.replace('MessageCircle,', 'MessageCircle, User, Copy,');
}

fs.writeFileSync('src/pages/Admin.tsx', content);
