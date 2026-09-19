const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('    ));\n}', '    ))}');

fs.writeFileSync(file, content);
console.log("Fixed syntax error again");
