const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = "        const opts = {\n      height: '100%',\n      width: '100%',\n      playerVars: {\n        autoplay: 1,\n      },\n    };\n";
content = content.replace(target1, '');

const safeOpts = "\n  const opts = {\n    height: '100%',\n    width: '100%',\n    playerVars: {\n      autoplay: 1,\n    },\n  };\n\n";
const returnIdx = content.lastIndexOf('  return (');
content = content.substring(0, returnIdx) + safeOpts + content.substring(returnIdx);

fs.writeFileSync(file, content);
console.log("Actually fixed!");
