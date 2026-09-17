const fs = require('fs');
let code = fs.readFileSync('src/components/ProjectForm.tsx', 'utf8');

const tCode = `
const t = {
  en: {
    editProject: 'Edit Project',
    newProject: 'New Project',
    basicInfo: 'Basic Information',
    title: 'Title',
    category: 'Category',
    selectCategory: 'Select category...',
    description: 'Synopsis / Description',
    client: 'Client',
    selectClient: 'Select a Client...',
    thumbnail: 'Thumbnail URL',
    videoUrl: 'Video URL (YouTube/Vimeo)',
    downloadSettings: 'Download Settings',
    allowDownloadDesc: 'Allow users to download this project using an access code.',
    fileUrl: 'File / Download URL',
    upload: 'Upload',
    generatedCode: 'Generated Access Code',
    evaluationLink: 'Evaluation Link',
    openLink: 'Open Link',
    generatedAfterSave: 'Access code and evaluation link will be generated after saving.',
    tags: 'Tags',
    addTag: 'Add a tag and press Enter',
    add: 'Add',
    cancel: 'Cancel',
    save: 'Save Project'
  },
  pt: {
    editProject: 'Editar Projeto',
    newProject: 'Novo Projeto',
    basicInfo: 'Informações Básicas',
    title: 'Título',
    category: 'Categoria',
    selectCategory: 'Selecione a categoria...',
    description: 'Sinopse / Descrição',
    client: 'Cliente',
    selectClient: 'Selecione um Cliente...',
    thumbnail: 'URL da Capa (Thumbnail)',
    videoUrl: 'URL do Vídeo (YouTube/Vimeo)',
    downloadSettings: 'Configurações de Download',
    allowDownloadDesc: 'Permitir que usuários baixem este projeto usando um código de acesso.',
    fileUrl: 'Arquivo / URL de Download',
    upload: 'Enviar',
    generatedCode: 'Código de Acesso Gerado',
    evaluationLink: 'Link de Avaliação',
    openLink: 'Abrir Link',
    generatedAfterSave: 'O código de acesso e link serão gerados ao salvar.',
    tags: 'Tags',
    addTag: 'Adicione uma tag e pressione Enter',
    add: 'Adicionar',
    cancel: 'Cancelar',
    save: 'Salvar Projeto'
  }
};
`;

code = code.replace("export default function ProjectForm", tCode + "\nexport default function ProjectForm");

// Replacements inside the JSX
code = code.replace(/{project \? 'Edit Project' : 'New Project'}/g, "{project ? t[lang].editProject : t[lang].newProject}");
code = code.replace(/Basic Information/g, "{t[lang].basicInfo}");
code = code.replace(/>Title</g, ">{t[lang].title}<");
code = code.replace(/>Category</g, ">{t[lang].category}<");
code = code.replace(/>Select category\.\.\.</g, ">{t[lang].selectCategory}<");
code = code.replace(/>Synopsis \/ Description</g, ">{t[lang].description}<");
code = code.replace(/>Client</g, ">{t[lang].client}<");
code = code.replace(/>Select a Client\.\.\.</g, ">{t[lang].selectClient}<");
code = code.replace(/>Thumbnail URL</g, ">{t[lang].thumbnail}<");
code = code.replace(/>Video URL \(YouTube\/Vimeo\)</g, ">{t[lang].videoUrl}<");
code = code.replace(/>Download Settings</g, ">{t[lang].downloadSettings}<");
code = code.replace(/Allow users to download this project using an access code\./g, "{t[lang].allowDownloadDesc}");
code = code.replace(/File \/ Download URL/g, "{t[lang].fileUrl}");
code = code.replace(/> Upload</g, "> {t[lang].upload}<");
code = code.replace(/>Generated Access Code</g, ">{t[lang].generatedCode}<");
code = code.replace(/>Evaluation Link</g, ">{t[lang].evaluationLink}<");
code = code.replace(/> Open Link</g, "> {t[lang].openLink}<");
code = code.replace(/Access code and evaluation link will be generated after saving\./g, "{t[lang].generatedAfterSave}");
code = code.replace(/>Tags</g, ">{t[lang].tags}<");
code = code.replace(/Add a tag and press Enter/g, "{t[lang].addTag}");
code = code.replace(/>Add</g, ">{t[lang].add}<");
code = code.replace(/>Cancel</g, ">{t[lang].cancel}<");
code = code.replace(/>Save Project</g, ">{t[lang].save}<");

// Placeholders replacement
code = code.replace(/placeholder="Brief synopsis of the project\.\.\."/g, "placeholder={lang === 'pt' ? 'Breve sinopse do projeto...' : 'Brief synopsis of the project...'}");

fs.writeFileSync('src/components/ProjectForm.tsx', code);
