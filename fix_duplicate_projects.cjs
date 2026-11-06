const fs = require('fs');
let content = fs.readFileSync('src/utils/storage.ts', 'utf8');

// In addProject
content = content.replace(/\/\/ 2\. Coleção separada por categoria com o TÍTULO do projeto como ID \(ex: projetos_imobiliario\/CASA_ALPHAVILLE\)[\s\S]*?\/\/ 3\. Estrutura hierárquica projetos > categoria > itens > TÍTULO\n\s*setDoc\(doc\(db, "projetos", catSlug, "itens", docTitleId\), cleanedData\)\.catch\(\(\) => \{\}\);/g, '');

// In updateProject
content = content.replace(/\/\/ 2\. Atualiza também na coleção por categoria e nome[\s\S]*?\/\/ 3\. Atualiza na estrutura hierárquica\n\s*setDoc\(doc\(db, "projetos", catSlug, "itens", docTitleId\), cleanedData, \{ merge: true \}\)\.catch\(\(\) => \{\}\);/g, '');

// In deleteProject
content = content.replace(/\/\/ 2\. Tenta deletar também da coleção por categoria[\s\S]*?\/\/ 3\. Tenta deletar da estrutura hierárquica\n\s*deleteDoc\(doc\(db, "projetos", catSlug, "itens", docTitleId\)\)\.catch\(\(\) => \{\}\);/g, '');

// In syncAllToFirestore (for projects)
content = content.replace(/\/\/ Adicionalmente, salva na estrutura hierárquica e na coleção por categoria\n\s*const catCollection = getProjectCategoryCollection\(p\.category\);\n\s*const catSlug = getCategorySlug\(p\.category\);\n\s*const docTitleId = formatProjectDocId\(p\.title\);\n\s*await setDoc\(doc\(db, catCollection, docTitleId\), cleaned\)\.catch\(\(\) => \{\}\);\n\s*await setDoc\(doc\(db, "projetos", catSlug, "itens", docTitleId\), cleaned\)\.catch\(\(\) => \{\}\);/g, '');

fs.writeFileSync('src/utils/storage.ts', content, 'utf8');
