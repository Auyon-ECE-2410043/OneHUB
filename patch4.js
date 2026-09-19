const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('{return messages.map(', '{messages.map(');
content = content.replace('    ));}', '    ))}');

fs.writeFileSync(file, content);
console.log("Fixed syntax error");
