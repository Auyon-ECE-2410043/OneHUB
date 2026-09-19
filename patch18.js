const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// We simply want to wrap {messages.map(...)} with React.useMemo(() => ..., [messages])
// But we cannot place React.useMemo directly inside JSX like that without it being an IIFE, wait.
// Actually {React.useMemo(() => messages.map(...), [messages])} IS valid JSX!
// Let's replace the start:
content = content.replace('{messages.map((msg, idx) => (', '{React.useMemo(() => messages.map((msg, idx) => (');

// And replace the end. The end is:
//         </div>
//       ))}
//               {loading && (
// Let's replace       ))} with       ))), [messages, navigate])}
content = content.replace(/      \)\)\}\r?\n              \{loading && \(/, "      ))), [messages, navigate])}\n              {loading && (");

fs.writeFileSync(file, content);
console.log("Memoized safely in JSX!");
