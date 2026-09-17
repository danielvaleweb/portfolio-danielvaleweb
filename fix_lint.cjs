const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// There are duplicate "Link" imports. Let's fix the lucide-react imports.
content = content.replace('MessageCircle, User, Copy, Link,', 'MessageCircle, User, Copy,');
// If we needed Link, maybe there was one from react-router-dom and one from lucide-react.
// In lucide-react, the icon for links is Link. Let's alias it as LinkIcon if react-router-dom Link is used.
if (content.includes('import { Link } from "react-router-dom"')) {
    content = content.replace('Link, // or wherever it is from lucide-react', 'LinkIcon,');
}
// Actually, let's just use regex to remove one if it's duplicated in the same line or alias it
// Wait, the error is:
// src/pages/Admin.tsx(5,67): error TS2300: Duplicate identifier 'Link'.
// src/pages/Admin.tsx(5,181): error TS2300: Duplicate identifier 'Link'.
// Line 5 is the lucide-react import.

const lucideMatch = content.match(/import \{([^}]+)\} from 'lucide-react';/);
if (lucideMatch) {
    let imports = lucideMatch[1].split(',').map(s => s.trim());
    // Remove duplicates
    imports = [...new Set(imports)];
    
    // Check if react-router-dom Link is also imported
    const routerMatch = content.match(/import \{([^}]+)\} from 'react-router-dom';/);
    if (routerMatch && routerMatch[1].includes('Link')) {
        // If lucide-react has Link, rename it to LinkIcon
        const linkIndex = imports.indexOf('Link');
        if (linkIndex !== -1) {
            imports[linkIndex] = 'Link as LinkIcon';
            // update usages
            content = content.replace(/<Link size/g, '<LinkIcon size');
        }
    }
    
    content = content.replace(lucideMatch[0], `import { ${imports.join(', ')} } from 'lucide-react';`);
}

fs.writeFileSync('src/pages/Admin.tsx', content);
