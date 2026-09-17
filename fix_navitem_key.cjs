const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Looking for where NavItem is defined
const defSearch = `const NavItem = ({ icon, label, active = false, disabled = false, onClick, collapsed = false, draggable = false, onDragStart, onDragOver, onDrop }: {`;
const defReplace = `const NavItem = ({ icon, label, active = false, disabled = false, onClick, collapsed = false, draggable = false, onDragStart, onDragOver, onDrop }: {
  key?: React.Key;`;

if (!content.includes('key?: React.Key;') && !content.includes('key?: any')) {
  content = content.replace(defSearch, defReplace);
}

// Previously I added key?: any, let's check
if (content.includes('key?: any')) {
  // It's there... wait, why is TS complaining?
  // TS says `Property 'key' does not exist on type...`
  // That means `key?: any` is NOT in the type definition in Admin.tsx
}

// Let's replace the whole definition:
const fullDefSearch = /const NavItem = \(\{ icon, label, active = false, disabled = false, onClick, collapsed = false, draggable = false, onDragStart, onDragOver, onDrop \}: \{\s*icon: React\.ReactNode,\s*label: string,\s*active\?: boolean,\s*disabled\?: boolean,\s*onClick\?: \(\) => void,\s*collapsed\?: boolean,\s*draggable\?: boolean,\s*onDragStart\?: any,\s*onDragOver\?: any,\s*onDrop\?: any\s*\}\) => \{/m;

const fullDefReplace = `const NavItem = ({ icon, label, active = false, disabled = false, onClick, collapsed = false, draggable = false, onDragStart, onDragOver, onDrop }: {
  icon: React.ReactNode,
  label: string,
  active?: boolean,
  disabled?: boolean,
  onClick?: () => void,
  collapsed?: boolean,
  draggable?: boolean,
  onDragStart?: any,
  onDragOver?: any,
  onDrop?: any,
  key?: React.Key
}) => {`;

content = content.replace(fullDefSearch, fullDefReplace);

fs.writeFileSync('src/pages/Admin.tsx', content);

