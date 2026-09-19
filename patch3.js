const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const optsIdx = content.indexOf('  const opts = {');
const optsEnd = content.indexOf('  };\n', optsIdx) + 5;
const optsStr = content.substring(optsIdx, optsEnd);

content = content.replace(optsStr, '');

const returnIdx = content.indexOf('  return (');
content = content.substring(0, returnIdx) + optsStr + '\n' + content.substring(returnIdx);

fs.writeFileSync(file, content);
console.log("Successfully moved opts back to the bottom!");
