const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// 1. Change the download card design
const downloadCardSearch = 'className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-[#111111] p-6 rounded-3xl border border-neutral-800 shadow-sm mt-6"';
const downloadCardReplace = 'className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-6 rounded-3xl shadow-lg mt-6"';
content = content.replace(downloadCardSearch, downloadCardReplace);

const textSearch = 'text-xs text-neutral-400 font-light mt-1 leading-relaxed';
const textReplace = 'text-xs text-white/90 font-light mt-1 leading-relaxed';
content = content.replace(textSearch, textReplace);

// 2. Add handleAddComment to handle the onComment from VideoPlayer
// We need to import addNotification from storage.
const importSearch = `import { getProjects, getEvaluations, updateProject } from "../utils/storage";`;
const importReplace = `import { getProjects, getEvaluations, updateProject, addNotification } from "../utils/storage";`;
content = content.replace(importSearch, importReplace);

// Inject handleAddComment right before return
const handleCommentFunc = `
  const handleAddComment = (text: string) => {
    if (!project) return;
    addNotification({
      projectId: project.id,
      projectName: project.title,
      message: \`"\${text}"\`
    });
    // Optional: show a small toast or just let it close
  };
`;

const returnSearch = '  return (';
content = content.replace(returnSearch, `${handleCommentFunc}\n  return (`);

// 3. Pass onComment to CustomVideoPlayer
const playerSearch = `<CustomVideoPlayer 
                src={project.videoUrl} 
                title={project.title} 
                poster={project.thumbnail} 
                onClose={() => setShowVideoModal(false)}
              />`;
const playerReplace = `<CustomVideoPlayer 
                src={project.videoUrl} 
                title={project.title} 
                poster={project.thumbnail} 
                onClose={() => setShowVideoModal(false)}
                onComment={handleAddComment}
              />`;
content = content.replace(playerSearch, playerReplace);

// Wait, the in-place player is also there? No, I removed the in-place player, it only plays in modal now.
// Let's verify if there is any other CustomVideoPlayer
const playerSearch2 = `<CustomVideoPlayer 
                    src={project.videoUrl} 
                    title={project.title} 
                    poster={project.thumbnail} 
                  />`;
const playerReplace2 = `<CustomVideoPlayer 
                    src={project.videoUrl} 
                    title={project.title} 
                    poster={project.thumbnail} 
                    onComment={handleAddComment}
                  />`;
content = content.replace(playerSearch2, playerReplace2);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

