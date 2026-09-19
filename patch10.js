const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// The exact string to remove
const badOpts = "        const opts = {\n      height: '100%',\n      width: '100%',\n      playerVars: {\n        autoplay: 1,\n      },\n    };\n\n  ";
if (content.includes(badOpts)) {
    content = content.replace(badOpts, '');
} else {
    // try a slightly different exact string
    const badOpts2 = "          const opts = {\n      height: '100%',\n      width: '100%',\n      playerVars: {\n        autoplay: 1,\n      },\n    };\n  \n";
    if (content.includes(badOpts2)) content = content.replace(badOpts2, '');
    else {
        // generic regex
        content = content.replace(/[\s]*const opts = \{[\s\S]*?autoplay: 1,\n[\s]*\},\n[\s]*\};[\s]*/, '\n');
    }
}

// Re-add opts safely
const safeOpts = "\n  const opts = {\n    height: '100%',\n    width: '100%',\n    playerVars: {\n      autoplay: 1,\n    },\n  };\n\n";
const returnBlock = "  return (\n    <div className=\"space-y-6 h-[calc(100vh-8rem)] flex flex-col\">";
content = content.replace(returnBlock, safeOpts + returnBlock);

fs.writeFileSync(file, content);
console.log("Safely fixed opts!");
