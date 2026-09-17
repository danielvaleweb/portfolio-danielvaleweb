const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Ensure Client type and its storage functions are imported
if (!content.includes('import { Project, Client }')) {
  content = content.replace('import { Project } from \'../types\';', 'import { Project, Client } from \'../types\';');
}
if (!content.includes('getClients, addClient')) {
  content = content.replace('import { getProjects, addProject, updateProject } from \'../utils/storage\';', 'import { getProjects, addProject, updateProject, getClients, addClient } from \'../utils/storage\';');
}

// Ensure Link, User, Upload, Share2, Mail, MessageCircle, Copy are imported from lucide-react
const missingIcons = ['Link', 'User', 'Upload', 'Share2', 'Mail', 'MessageCircle', 'Copy'];
for (const icon of missingIcons) {
  if (!content.includes(icon + ',')) {
    content = content.replace('LogOut\n}', `LogOut, ${icon}\n}`);
  }
}

fs.writeFileSync('src/pages/Admin.tsx', content);
