const fs = require('fs');
let content = fs.readFileSync('src/utils/storage.ts', 'utf8');

// Use regex to replace the arrays with empty arrays
content = content.replace(/const INITIAL_NOTES: Note\[\] = \[[\s\S]*?\];/m, 'const INITIAL_NOTES: Note[] = [];');
content = content.replace(/const INITIAL_FILES: FileAsset\[\] = \[[\s\S]*?\];/m, 'const INITIAL_FILES: FileAsset[] = [];');
content = content.replace(/const INITIAL_CONVERSATIONS: Conversation\[\] = \[[\s\S]*?\];/m, 'const INITIAL_CONVERSATIONS: Conversation[] = [];');
content = content.replace(/const INITIAL_EMAILS: EmailItem\[\] = \[[\s\S]*?\];/m, 'const INITIAL_EMAILS: EmailItem[] = [];');
content = content.replace(/const INITIAL_EVENTS: CalendarEvent\[\] = \[[\s\S]*?\];/m, 'const INITIAL_EVENTS: CalendarEvent[] = [];');
content = content.replace(/const INITIAL_KNOWLEDGE: KnowledgeArticle\[\] = \[[\s\S]*?\];/m, 'const INITIAL_KNOWLEDGE: KnowledgeArticle[] = [];');
content = content.replace(/const INITIAL_TICKETS: SupportTicket\[\] = \[[\s\S]*?\];/m, 'const INITIAL_TICKETS: SupportTicket[] = [];');

fs.writeFileSync('src/utils/storage.ts', content, 'utf8');
