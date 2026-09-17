const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

const cardSearch = 'className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-6 rounded-3xl shadow-lg mt-6"';
const cardReplace = 'className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-[#111111] border border-neutral-800 p-6 rounded-3xl shadow-lg mt-6"';

content = content.replace(cardSearch, cardReplace);

// The text inside was changed to white/90, we can keep it white or change to neutral-400
content = content.replace('text-white/90', 'text-neutral-400');

// The button was bg-white text-black. Change to Instagram gradient text-white.
const btnSearch = 'className="w-full xl:w-auto bg-white hover:bg-neutral-200 active:scale-[0.98] text-black text-[11px] font-bold uppercase tracking-[0.1em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"';
const btnReplace = 'className="w-full xl:w-auto bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90 active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-[0.1em] py-3.5 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center gap-2"';

content = content.replace(btnSearch, btnReplace);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);
