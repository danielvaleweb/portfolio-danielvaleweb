const fs = require('fs');

let typesContent = fs.readFileSync('src/types.ts', 'utf8');
typesContent = typesContent.replace(/export const initialEvaluations: Evaluation\[\] = \[([\s\S]*?)\];/, 'export const initialEvaluations: Evaluation[] = [];');
fs.writeFileSync('src/types.ts', typesContent);
