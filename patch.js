const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const optsIdx = content.indexOf('const opts = {');
const optsEnd = content.indexOf('  };', optsIdx) + 4;
const optsStr = content.substring(optsIdx, optsEnd);
content = content.replace(optsStr, '');

const memoIdx = content.indexOf('const memoizedMessages = React.useMemo');
const memoEnd = content.indexOf('  }, [messages]);', memoIdx) + 17;
const memoStr = content.substring(memoIdx, memoEnd);
content = content.replace(memoStr, '');

const insertPoint = "const [activeVideo, setActiveVideo] = useState(null);";
content = content.replace(insertPoint, insertPoint + "\n\n  " + optsStr + "\n\n  " + memoStr + "\n");
fs.writeFileSync(file, content);
console.log("Successfully moved blocks!");
