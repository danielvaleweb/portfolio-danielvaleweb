const fs = require('fs');

let content = fs.readFileSync('src/components/CustomVideoPlayer.tsx', 'utf8');

const propsSearch = 'interface CustomVideoPlayerProps {\n  src: string;\n  title?: string;\n  poster?: string;\n}';
const propsReplace = 'interface CustomVideoPlayerProps {\n  src: string;\n  title?: string;\n  poster?: string;\n  onClose?: () => void;\n}';
content = content.replace(propsSearch, propsReplace);

const argsSearch = 'export default function CustomVideoPlayer({ src, title, poster }: CustomVideoPlayerProps) {';
const argsReplace = 'export default function CustomVideoPlayer({ src, title, poster, onClose }: CustomVideoPlayerProps) {';
content = content.replace(argsSearch, argsReplace);

const backBtnSearch = '<button onClick={() => window.history.back()} className="text-white hover:text-gray-300 p-2">';
const backBtnReplace = '<button onClick={() => { if (onClose) onClose(); else window.history.back(); }} className="text-white hover:text-gray-300 p-2">';
content = content.replace(backBtnSearch, backBtnReplace);

fs.writeFileSync('src/components/CustomVideoPlayer.tsx', content);

