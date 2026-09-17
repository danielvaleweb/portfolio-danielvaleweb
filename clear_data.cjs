const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const projectsStart = "export const projects: Project[] = [";
const clientsStart = "export interface Client {"; // To find the end of projects array roughly

const pStartIdx = content.indexOf(projectsStart);
const pEndIdx = content.indexOf("];", pStartIdx) + 2;

if (pStartIdx !== -1 && pEndIdx !== -1) {
    content = content.substring(0, pStartIdx) + "export const projects: Project[] = [];\n" + content.substring(pEndIdx);
}

fs.writeFileSync('src/types.ts', content);
