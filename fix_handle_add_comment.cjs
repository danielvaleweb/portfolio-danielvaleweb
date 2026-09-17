const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// The main component starts like this:
// export default function ProjectDetail() {
// Let's find a safe place to inject handleAddComment, like right after useEffects.
const search = '  if (!project) {';

const replace = `
  const handleAddComment = (text: string) => {
    if (!project) return;
    addNotification({
      projectId: project.id,
      projectName: project.title,
      message: \`"\${text}"\`
    });
  };

  if (!project) {`;

content = content.replace(search, replace);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

