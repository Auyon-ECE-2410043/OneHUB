const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Find the block of state declarations
const statesRegex = /  const \[input, setInput\].*?\n  const \[loading, setLoading\].*?\n  const \[activeVideo, setActiveVideo\].*?\n  const \[videoSummary, setVideoSummary\].*?\n  const \[summarizing, setSummarizing\].*?\n  const \[selectedFile, setSelectedFile\].*?\n  const fileInputRef = useRef\(null\);\n/s;

const match = content.match(statesRegex);
if (match) {
    // 2. Remove them from their current position
    content = content.replace(statesRegex, '');
    
    // 3. Insert them right after setMessages
    const insertAfter = "    ];\n  });\n";
    content = content.replace(insertAfter, insertAfter + "\n" + match[0]);
    
    fs.writeFileSync(file, content);
    console.log("Moved states to top to fix TDZ bug!");
} else {
    console.log("Could not find states block");
}
