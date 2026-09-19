const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}", "remarkPlugins={[remarkGfm]}");
content = content.replace("import remarkMath from 'remark-math';\nimport rehypeKatex from 'rehype-katex';\nimport 'katex/dist/katex.min.css';", "");

fs.writeFileSync(file, content);
console.log("Removed math plugins");
