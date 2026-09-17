const fs = require('fs');
let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
// Look for where NavItem is defined.
const navDef = 'const NavItem = ({ icon, label, active = false, disabled = false, onClick, collapsed = false, draggable = false, onDragStart, onDragOver, onDrop }: {';
const navDefFix = 'const NavItem = ({ icon, label, active = false, disabled = false, onClick, collapsed = false, draggable = false, onDragStart, onDragOver, onDrop }: {\n  key?: any,';
adminContent = adminContent.replace(navDef, navDefFix);
fs.writeFileSync('src/pages/Admin.tsx', adminContent);
