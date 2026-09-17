const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// I need to undo the messed up injection and put it in the right place.
// Wait, the first `  return (` was part of the useEffect:
// Before:
//       const timer = setTimeout(() => {
//         incrementView();
//       }, 3000);
//       
//       return () => clearTimeout(timer);

// But it became:
//       const timer = setTimeout(() => {
//         incrementView();
//       }, 3000);
//       
//     
//   const handleAddComment = (text: string) => {
//     if (!project) return;
//     addNotification({
//       projectId: project.id,
//       projectName: project.title,
//       message: `"${text}"`
//     });
//     // Optional: show a small toast or just let it close
//   };
// 
//   return () => clearTimeout(timer);


const badInjectionSearch = `    
  const handleAddComment = (text: string) => {
    if (!project) return;
    addNotification({
      projectId: project.id,
      projectName: project.title,
      message: \`"\${text}"\`
    });
    // Optional: show a small toast or just let it close
  };

  return () => clearTimeout(timer);`;

const correctUseEffectReturn = `  return () => clearTimeout(timer);`;

content = content.replace(badInjectionSearch, correctUseEffectReturn);


// Now inject handleAddComment right before the MAIN return of the component.
// The main return usually looks like `  return (\n    <div className=`
const mainReturnSearch = '  return (\n    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-200 selection:bg-neutral-800 selection:text-white pb-20 relative">';

const handleAddCommentDef = `
  const handleAddComment = (text: string) => {
    if (!project) return;
    addNotification({
      projectId: project.id,
      projectName: project.title,
      message: \`"\${text}"\`
    });
  };

`;

content = content.replace(mainReturnSearch, handleAddCommentDef + mainReturnSearch);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

