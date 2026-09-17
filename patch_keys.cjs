const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Looking at lines 525 and 550, they map over menuItems to render NavItem, but missing key prop?
// Yes:
// 525: {menuItems.filter(...).map((item) => ( <NavItem ... /> ))}
// 550: {menuItems.filter(...).map((item) => ( <NavItem ... /> ))}

const search1 = `{menuItems.filter(item => item.section === 'main' && visibleMenuIds.has(item.id)).map((item) => (
                <NavItem`;
const replace1 = `{menuItems.filter(item => item.section === 'main' && visibleMenuIds.has(item.id)).map((item) => (
                <NavItem key={item.id}`;

const search2 = `{menuItems.filter(item => item.section === 'more' && visibleMenuIds.has(item.id)).map((item) => (
                <NavItem`;
const replace2 = `{menuItems.filter(item => item.section === 'more' && visibleMenuIds.has(item.id)).map((item) => (
                <NavItem key={item.id}`;

content = content.replace(search1, replace1);
content = content.replace(search2, replace2);

fs.writeFileSync('src/pages/Admin.tsx', content);

