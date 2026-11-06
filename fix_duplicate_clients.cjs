const fs = require('fs');
let content = fs.readFileSync('src/utils/storage.ts', 'utf8');

// Remove writes to 'clients' in addClient
content = content.replace(/\/\/ 2\. Mantém sincronizado na coleção 'clients'[\s\S]*?console\.warn\("Aviso ao sincronizar na coleção 'clients' do Firestore:", err\?\.message \|\| err\);\n\s*\}\n\s*\}/g, '');

// Remove writes to 'clients' in updateClient
content = content.replace(/\/\/ 2\. Mantém sincronizado na coleção 'clients'[\s\S]*?console\.warn\("Aviso ao atualizar na coleção 'clients':", err\?\.message \|\| err\);\n\s*\}/g, '');

// Remove delete from 'clients' in deleteClient
content = content.replace(/deleteDoc\(doc\(db, "clients", id\)\)\.catch\(\(\) => \{\}\);/g, '');

// Remove snapshot listener for 'clients' in startFirestoreSync
content = content.replace(/\/\/ 2b\. Fallback listener para 'clients'[\s\S]*?console\.warn\("Firestore snapshot clients fallback listener:", error\.message\);\n\s*\}\);\n\s*\} catch \(err\) \{\}/g, '');

// Also remove from syncAllToFirestore
content = content.replace(/await setDoc\(doc\(db, "clients", c\.id\), cleaned\)\.catch\(\(\) => \{\}\);/g, '');

fs.writeFileSync('src/utils/storage.ts', content, 'utf8');
