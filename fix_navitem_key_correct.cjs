const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const oldDef = 'const NavItem = ({ icon: Icon, label, active = false, disabled = false, onClick, collapsed = false, draggable, onDragStart, onDragOver, onDrop }: { icon: any, label: string, active?: boolean, disabled?: boolean, onClick?: () => void, collapsed?: boolean, draggable?: boolean, onDragStart?: any, onDragOver?: any, onDrop?: any }) => (';
const newDef = 'const NavItem = ({ icon: Icon, label, active = false, disabled = false, onClick, collapsed = false, draggable, onDragStart, onDragOver, onDrop }: { icon: any, label: string, active?: boolean, disabled?: boolean, onClick?: () => void, collapsed?: boolean, draggable?: boolean, onDragStart?: any, onDragOver?: any, onDrop?: any, key?: React.Key }) => (';

content = content.replace(oldDef, newDef);

fs.writeFileSync('src/pages/Admin.tsx', content);

