const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const mapStart = "            {messages.map((msg, idx) => (";
const newMapStart = "            {renderedMessages}";

const mapEnd = "        </div>\r\n      ))}\r\n              {loading && (";
const newMapEnd = "        </div>\r\n      ))}\r\n\r\n  return (\r\n    <div className=\"space-y-6 h-[calc(100vh-8rem)] flex flex-col\">\r\n      <div className=\"flex items-center justify-between\">\r\n        <div>";

// Wait, I will just extract the block using substring
const idxStart = content.indexOf(mapStart);
const idxEnd = content.indexOf("      ))}\r\n              {loading && (") + 9;

if (idxStart !== -1 && idxEnd !== -1) {
    const mapBlock = content.substring(idxStart + 13, idxEnd); // captures messages.map...
    
    // Replace the block in the JSX
    content = content.substring(0, idxStart) + "            {memoizedMessages}\r\n" + content.substring(idxEnd);
    
    // Insert memoizedMessages before return
    const memoBlock = "\n  const memoizedMessages = React.useMemo(() => " + mapBlock + ", [messages, navigate]);\n\n";
    const returnIdx = content.indexOf("  return (\r\n");
    content = content.substring(0, returnIdx) + memoBlock + content.substring(returnIdx);
    
    fs.writeFileSync(file, content);
    console.log("Memoized messages cleanly!");
} else {
    console.log("Could not find boundaries");
}
