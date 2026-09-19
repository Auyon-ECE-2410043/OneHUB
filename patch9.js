const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the top import mess
const badTop = "import        const opts = {\n    height: '100%',\n    width: '100%',\n    playerVars: {\n      autoplay: 1,\n    },\n  };\n\nReact, { useState, useRef, useEffect } from 'react';";
content = content.replace(badTop, "import React, { useState, useRef, useEffect } from 'react';");

// 2. Put opts back correctly at the bottom
const mainReturnIdx = content.lastIndexOf('  return (');
if (mainReturnIdx !== -1) {
    const safeOpts = "\n  const opts = {\n    height: '100%',\n    width: '100%',\n    playerVars: {\n      autoplay: 1,\n    },\n  };\n\n";
    content = content.substring(0, mainReturnIdx) + safeOpts + content.substring(mainReturnIdx);
}

fs.writeFileSync(file, content);
console.log("Fixed the horrible file destruction!");
