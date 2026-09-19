const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const lastIdx = content.lastIndexOf('    ))}');
content = content.substring(0, lastIdx) + '    ))), [messages, navigate])}' + content.substring(lastIdx + 7);

fs.writeFileSync(file, content);
console.log("Fixed useMemo!");
