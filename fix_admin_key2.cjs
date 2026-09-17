const fs = require('fs');
let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

adminContent = adminContent.replace(/<NavItem\s*\n\s*key=\{item.id\}/g, '<NavItem ');
adminContent = adminContent.replace(/<NavItem\s*key=\{item.id\}/g, '<NavItem ');
adminContent = adminContent.replace(/<NavItem key=\{item.id\}/g, '<NavItem');

fs.writeFileSync('src/pages/Admin.tsx', adminContent);
