const fs = require('fs');
let content = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

// Add onComment prop
const propsSearch = 'interface CustomVideoPlayerProps {\n  src: string;\n  title?: string;\n  poster?: string;\n  onClose?: () => void;\n}';
const propsReplace = 'interface CustomVideoPlayerProps {\n  src: string;\n  title?: string;\n  poster?: string;\n  onClose?: () => void;\n  onComment?: (text: string) => void;\n}';
content = content.replace(propsSearch, propsReplace);

const argsSearch = 'export default function CustomVideoPlayer({ src, title, poster, onClose }: CustomVideoPlayerProps) {';
const argsReplace = 'export default function CustomVideoPlayer({ src, title, poster, onClose, onComment }: CustomVideoPlayerProps) {';
content = content.replace(argsSearch, argsReplace);

// State for comment
const stateSearch = 'const [showControls, setShowControls] = useState(true);';
const stateReplace = `const [showControls, setShowControls] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");`;
content = content.replace(stateSearch, stateReplace);

// Comment button logic
const commentBtnSearch = `<button onClick={() => alert('Em breve! O sistema de comentários estará disponível na próxima atualização.')} className="text-white hover:text-gray-300 transition-colors cursor-pointer group relative" title="Comentar">
              <MessageSquare size={20} />
            </button>`;
const commentBtnReplace = `<div className="relative group/comment flex items-center">
              <button onClick={() => setShowCommentBox(!showCommentBox)} className="text-white hover:text-gray-300 transition-colors cursor-pointer group relative" title="Comentar">
                <MessageSquare size={20} />
              </button>
              
              <AnimatePresence>
                {showCommentBox && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-4 w-72 bg-black/90 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-2xl flex flex-col gap-3 cursor-auto z-50"
                  >
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider">Deixe um comentário</h4>
                    <textarea
                      autoFocus
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Escreva seu comentário aqui..."
                      className="w-full bg-white/10 text-white text-[13px] rounded-lg p-3 outline-none resize-none min-h-[80px] placeholder:text-gray-400 focus:bg-white/20 transition-colors"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button onClick={() => setShowCommentBox(false)} className="text-[11px] text-gray-400 hover:text-white px-3 py-2 transition-colors cursor-pointer">Cancelar</button>
                      <button 
                        onClick={() => {
                          if (commentText.trim() && onComment) {
                            onComment(commentText);
                            setCommentText("");
                            setShowCommentBox(false);
                          }
                        }} 
                        className="text-[11px] bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Enviar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>`;

// Wait, I need to add import { motion, AnimatePresence } from 'motion/react' in CustomVideoPlayer
const importSearch = "import { Play, Pause";
const importReplace = "import { motion, AnimatePresence } from 'motion/react';\nimport { Play, Pause";
if (!content.includes('import { motion')) {
  content = content.replace(importSearch, importReplace);
}

content = content.replace(commentBtnSearch, commentBtnReplace);

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', content);

