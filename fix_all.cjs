const fs = require('fs');

// 1. Reset Storage keys
let storageContent = fs.readFileSync('src/utils/storage.ts', 'utf8');
storageContent = storageContent.replace(/const PROJECTS_KEY = 'v2_projects';/g, "const PROJECTS_KEY = 'v3_projects';");
storageContent = storageContent.replace(/const CLIENTS_KEY = 'v2_clients';/g, "const CLIENTS_KEY = 'v3_clients';");
storageContent = storageContent.replace(/const EVALS_KEY = 'v2_evals';/g, "const EVALS_KEY = 'v3_evals';");
// Just in case they are named differently:
storageContent = storageContent.replace(/const PROJECTS_KEY = 'dashboard_projects';/g, "const PROJECTS_KEY = 'v3_projects';");
storageContent = storageContent.replace(/const CLIENTS_KEY = 'dashboard_clients';/g, "const CLIENTS_KEY = 'v3_clients';");
fs.writeFileSync('src/utils/storage.ts', storageContent);

// 2. Fix Admin.tsx
let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// We need to extract the modals out of Card and put them at the end of Admin.
// First, find where Card ends and Admin begins.
const adminIndex = adminContent.indexOf('export default function Admin() {');
const cardContent = adminContent.substring(0, adminIndex);
let restContent = adminContent.substring(adminIndex);

// Identify the modals inside Card Content.
const modalsStartStr = '{/* Create Client Modal */}';
const modalIndex = cardContent.indexOf(modalsStartStr);

if (modalIndex !== -1) {
    const modalsContent = cardContent.substring(modalIndex, cardContent.lastIndexOf('    </div>\n  );\n}'));
    // Remove modals from Card
    const newCardContent = cardContent.substring(0, modalIndex) + '    </div>\n  );\n}\n\n';
    
    // Inject modals at the end of Admin
    const adminEnd = restContent.lastIndexOf('    </div>\n  );\n}');
    const newRestContent = restContent.substring(0, adminEnd) + modalsContent + '\n    </div>\n  );\n}';
    
    fs.writeFileSync('src/pages/Admin.tsx', newCardContent + newRestContent);
}

