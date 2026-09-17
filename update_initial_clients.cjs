const fs = require('fs');

let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace(/export const initialClients: Client\[\] = \[([\s\S]*?)\];/, 'export const initialClients: Client[] = [];');
fs.writeFileSync('src/types.ts', typesContent);
