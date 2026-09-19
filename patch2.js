const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove useMemo block
const memoIdx = content.indexOf('const memoizedMessages = React.useMemo(() => {');
const memoEnd = content.indexOf('  }, [messages]);\n', memoIdx) + 18;
const memoStr = content.substring(memoIdx, memoEnd);
content = content.replace(memoStr, '');

// 2. Extract the actual map block
const returnIdx = memoStr.indexOf('return messages.map');
const mapBlock = memoStr.substring(returnIdx + 7, memoStr.lastIndexOf('  }, [messages]);') - 1).trim() + '\n';

// 3. Replace {memoizedMessages} with the map block
content = content.replace('{memoizedMessages}', '{' + mapBlock + '}');

fs.writeFileSync(file, content);
console.log("Successfully replaced memoizedMessages with inline map!");
