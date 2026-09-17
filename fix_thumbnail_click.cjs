const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// The image showed a full-screen or expanded media player.
// I will create a Fullscreen Video Modal that opens when clicking the thumbnail.

const isPlayingStateSearch = 'const [isPlaying, setIsPlaying] = useState(false);';
const isPlayingStateReplace = `const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);`;

content = content.replace(isPlayingStateSearch, isPlayingStateReplace);

// Let's modify the thumbnail click to open the modal instead of playing in-place.
// The in-place playing with custom player is okay, but wait: the user said "ative a tela de mídia da imagem anexada", and the image is a FULL SCREEN player with a back button.
// So let's wrap the CustomVideoPlayer in a fullscreen modal when clicked.

const thumbnailClickSearch = `
              {!isPlaying ? (
                <div 
                  className="absolute inset-0 w-full h-full cursor-pointer group overflow-hidden"
                  onClick={() => setIsPlaying(true)}
                >
`;
const thumbnailClickReplace = `
              {!showVideoModal ? (
                <div 
                  className="absolute inset-0 w-full h-full cursor-pointer group overflow-hidden"
                  onClick={() => setShowVideoModal(true)}
                >
`;
content = content.replace(thumbnailClickSearch, thumbnailClickReplace);

// We should also replace the !isPlaying block with !showVideoModal
const videoBlockSearch = `
              ) : isEmbed ? (
                <iframe
                  key={project.videoUrl}
                  src={getEmbedUrl(project.videoUrl)}
                  title={project.title}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 w-full h-full">
                  <CustomVideoPlayer 
                    src={project.videoUrl} 
                    title={project.title} 
                    poster={project.thumbnail} 
                  />
                </div>
              )}
`;
const videoBlockReplace = `
              ) : null}
`;
content = content.replace(videoBlockSearch, videoBlockReplace);

// Add the Fullscreen Video Modal at the bottom of the component
const modalInsertSearch = '{/* Download Code Modal */}';
const modalCode = `
      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[150] bg-black flex items-center justify-center"
          >
            {isEmbed ? (
              <div className="relative w-full h-full pt-16">
                 <button onClick={() => setShowVideoModal(false)} className="absolute top-4 left-4 z-50 text-white hover:text-gray-300 p-2">
                   <X size={28} />
                 </button>
                 <iframe
                    key={project.videoUrl}
                    src={getEmbedUrl(project.videoUrl)}
                    title={project.title}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
              </div>
            ) : (
              <CustomVideoPlayer 
                src={project.videoUrl} 
                title={project.title} 
                poster={project.thumbnail} 
                onClose={() => setShowVideoModal(false)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
`;
content = content.replace(modalInsertSearch, `${modalCode}\n\n      {/* Download Code Modal */}`);

fs.writeFileSync('src/pages/ProjectDetail.tsx', content);

