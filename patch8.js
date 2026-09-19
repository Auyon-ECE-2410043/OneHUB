const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the misplaced opts block
const optsRegex = /        const opts = \{\n      height: '100%',\n      width: '100%',\n      playerVars: \{\n        autoplay: 1,\n      \},\n    \};\n/;
content = content.replace(optsRegex, '');

// 2. Add opts safely right above the MAIN return block
const safeOpts = \n  const opts = {\n    height: '100%',\n    width: '100%',\n    playerVars: {\n      autoplay: 1,\n    },\n  };\n\n;
const mainReturnIdx = content.lastIndexOf('  return (');
if (mainReturnIdx !== -1) {
    content = content.substring(0, mainReturnIdx) + safeOpts + content.substring(mainReturnIdx);
    fs.writeFileSync(file, content);
    console.log("Fixed opts scope bug beautifully!");
} else {
    console.log("Could not find main return");
}
