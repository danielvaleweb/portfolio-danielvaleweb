const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// The user wants 4 items per page in the grid, and grid-cols-4.
// Let's modify the itemsPerPage and the grid structure.

// Currently itemsPerPage: `const itemsPerPage = viewMode === 'grid' ? 8 : 8;`
// Change it to 4.
content = content.replace("const itemsPerPage = viewMode === 'grid' ? 8 : 8;", "const itemsPerPage = 4;");

// Update grid template
// Currently: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5`
// We should make it exactly 4 columns on large screens to fit 4 cards perfectly.
// `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
const gridSearch = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-5';
const gridReplace = 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5';
content = content.replace(gridSearch, gridReplace);

fs.writeFileSync('src/pages/Admin.tsx', content);

