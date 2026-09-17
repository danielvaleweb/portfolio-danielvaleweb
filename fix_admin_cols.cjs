const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// The dark mode issue for cards is probably because `bg-[#161616]` does not have `dark:bg-[#161616]` logic, it's just hardcoded.
// If the whole card is supposed to be dark always, let's keep it. But if it's supposed to be responsive to the theme:
// The image shows it's always dark, but wait: "os cards do projeto quando muda o tema de claro para escuro ta ficando escuro"
// If it should adapt, we should use bg-white dark:bg-[#161616].

const darkCardSearch = 'className={`bg-[#161616] border ${isSelected ? \'border-white\' : \'border-[#222]\'} rounded-[24px] p-4 flex flex-col relative hover:bg-[#1c1c1c] transition-colors cursor-pointer group shadow-sm`}';
const darkCardReplace = 'className={`bg-white dark:bg-[#161616] border ${isSelected ? \'border-black dark:border-white\' : \'border-gray-200 dark:border-[#222]\'} rounded-[24px] p-4 flex flex-col relative hover:bg-gray-50 dark:hover:bg-[#1c1c1c] transition-colors cursor-pointer group shadow-sm`}';
content = content.replace(darkCardSearch, darkCardReplace);

// Content text colors
const titleSearch = 'text-[14px] font-bold text-white mb-3';
const titleReplace = 'text-[14px] font-bold text-gray-900 dark:text-white mb-3';
content = content.replace(titleSearch, titleReplace);

// We need to fix the grid columns for 4x4
const gridColsSearch = 'className={`flex-1 ${viewMode === \'grid\' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5" : "flex flex-col gap-3"} overflow-hidden pb-4`}';
const gridColsReplace = 'className={`flex-1 ${viewMode === \'grid\' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-5" : "flex flex-col gap-3"} overflow-hidden pb-4`}';
content = content.replace(gridColsSearch, gridColsReplace);

// "Nos cards do projeto ta ficando alguns cortados."
// This is because of `overflow-hidden` on the grid container.
// Let's change `overflow-hidden pb-4` to `overflow-visible pb-4` or `overflow-y-auto no-scrollbar pb-4`.
const gridColsReplace2 = gridColsReplace.replace('overflow-hidden', 'overflow-y-auto no-scrollbar');
content = content.replace(gridColsReplace, gridColsReplace2);

fs.writeFileSync('src/pages/Admin.tsx', content);

