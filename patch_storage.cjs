const fs = require('fs');

let content = fs.readFileSync('src/utils/storage.ts', 'utf8');

// Also need to add Notification to types.ts or just define it here.
// I'll export the interface from storage to keep it simple, or add it to types.ts. Let's add it to types.ts.

