const fs = require('fs');

let content = fs.readFileSync('src/pages/ProjectDetail.tsx', 'utf8');

// Is the download card inside the <div className="lg:col-span-4 space-y-6"> ?
const search = `
            {/* Download Card */}
            {project.downloadUrl && (
              <motion.div`;

const rightColSearch = '<div className="lg:col-span-4 space-y-6">';

const indexDownloadCard = content.indexOf(search);
const indexRightCol = content.indexOf(rightColSearch);

// Let's make sure the card is in the correct place. 
// Before, I used replace with '          </div>\n        </div>\n      </div>\n\n      {/* Download Code Modal */}'.
// Let's just double check the right column.

