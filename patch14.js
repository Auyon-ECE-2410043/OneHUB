const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove duplicate imports
const dupes = "import remarkMath from 'remark-math';\nimport rehypeKatex from 'rehype-katex';\nimport 'katex/dist/katex.min.css';";
// Replace the CRLF version
content = content.replace(/import remarkMath from 'remark-math';\r?\nimport rehypeKatex from 'rehype-katex';\r?\nimport 'katex\/dist\/katex.min.css';\r?\n/, '');

// 2. Extract states and move them to the top
const statesRegex = /[ \t]*const \[input, setInput\] = useState\(''\);\r?\n[ \t]*const \[loading, setLoading\] = useState\(false\);\r?\n[ \t]*const \[activeVideo, setActiveVideo\] = useState\(null\);\r?\n[ \t]*const \[videoSummary, setVideoSummary\] = useState\(null\);\r?\n[ \t]*const \[summarizing, setSummarizing\] = useState\(false\);\r?\n[ \t]*const \[selectedFile, setSelectedFile\] = useState\(null\);\r?\n[ \t]*const fileInputRef = useRef\(null\);\r?\n/;

const match = content.match(statesRegex);
if (match) {
    content = content.replace(statesRegex, '');
    const insertAfter = "    ];\r?\n  }\\);\r?\n";
    // We use string match to find where to insert
    const insertMatch = content.match(/    \];\r?\n  \}\);\r?\n/);
    if (insertMatch) {
        content = content.replace(insertMatch[0], insertMatch[0] + "\n" + match[0]);
    } else {
        console.log("Could not find insert position");
    }
} else {
    console.log("Could not find states block");
}

fs.writeFileSync(file, content);
console.log("Fixed cleanly!");
