const fs = require('fs');
let formContent = fs.readFileSync('src/components/ProjectForm.tsx', 'utf8');

// The replacement in patch_form.cjs failed because it looked for a specific string that didn't match.
if (!formContent.includes('firebase/storage')) {
    formContent = 'import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";\nimport { storage } from "../firebase";\nimport { Loader } from "lucide-react";\n' + formContent;
}

fs.writeFileSync('src/components/ProjectForm.tsx', formContent);

let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
adminContent = adminContent.replace(/key\?: React\.Key/g, 'key?: any');
if (!adminContent.includes('key?: any')) {
   // The replacement for NavItem props failed because the search string wasn't exactly right.
   // Let's use a simpler regex
   adminContent = adminContent.replace(/onDrop\?: any\n}\) => \{/g, 'onDrop?: any,\n  key?: any\n}) => {');
}
fs.writeFileSync('src/pages/Admin.tsx', adminContent);
