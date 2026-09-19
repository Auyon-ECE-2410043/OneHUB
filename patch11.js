const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const importTarget = "import remarkGfm from 'remark-gfm';";
content = content.replace(importTarget, "import remarkGfm from 'remark-gfm';\nimport remarkMath from 'remark-math';\nimport rehypeKatex from 'rehype-katex';\nimport 'katex/dist/katex.min.css';");

const markdownTarget = "<ReactMarkdown remarkPlugins={[remarkGfm]}>";
content = content.replace(markdownTarget, "<ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>");

fs.writeFileSync(file, content);
console.log("Restored katex");
