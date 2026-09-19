const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Find opts block
const optsIdx = content.indexOf('        const opts = {');
if (optsIdx !== -1) {
    const optsEnd = content.indexOf('    };\n', optsIdx) + 7;
    const optsStr = content.substring(optsIdx, optsEnd);
    // Remove it from the incorrect location
    content = content.replace(optsStr, '');
    
    // 2. Put it right above return (
    const mainReturnIdx = content.lastIndexOf('  return (');
    content = content.substring(0, mainReturnIdx) + '  ' + optsStr.trim() + '\n\n' + content.substring(mainReturnIdx);
    
    fs.writeFileSync(file, content);
    console.log("Fixed opts scope bug!");
} else {
    console.log("Could not find opts block");
}
