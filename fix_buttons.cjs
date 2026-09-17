const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Replace green Whatsapp button with dashboard style black button
content = content.replace(
  /className="w-full bg-\[\#25D366\] hover:bg-\[\#128C7E\] text-white py-3 rounded-xl text-\[14px\] font-bold transition-colors flex items-center justify-center gap-2"/g,
  'className="w-full bg-gray-200 hover:bg-gray-300 text-black dark:bg-[#222] dark:hover:bg-[#333] dark:text-white py-3 rounded-full text-[14px] font-bold transition-colors flex items-center justify-center gap-2"'
);

// Replace email button to be rounded-full
content = content.replace(
  /className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black py-3 rounded-xl text-\[14px\] font-bold transition-colors flex items-center justify-center gap-2"/g,
  'className="w-full bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black py-3 rounded-full text-[14px] font-bold transition-colors flex items-center justify-center gap-2"'
);

fs.writeFileSync('src/pages/Admin.tsx', content);
