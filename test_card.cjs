const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Ensure the Link icon is imported from lucide-react (used in the bottom bar)
if (!content.includes('Link,')) {
    content = content.replace('MessageCircle, User, Copy,', 'MessageCircle, User, Copy, Link,');
}

fs.writeFileSync('src/pages/Admin.tsx', content);
