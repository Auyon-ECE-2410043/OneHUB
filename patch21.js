const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

// I will define the memoizedMessages correctly above the return, exactly as I should have from the beginning!
// Wait! I will just create a memo block.
const mapStart = "{React.useMemo(() => messages.map((msg, idx) => (";
const mapEnd = "    ))), [messages, navigate])}";

// I will revert the file to clean state by removing these and putting back the original.
content = content.replace(mapStart, "{messages.map((msg, idx) => (");
content = content.replace(mapEnd, "    ))}");

// Now I will safely extract the entire map block into memoizedMessages!
const startIdx = content.indexOf("            {messages.map");
const endIdx = content.indexOf("    ))}\r\n              {loading &&");

if (startIdx !== -1 && endIdx !== -1) {
    const mapStr = content.substring(startIdx + 13, endIdx + 6); // gets "messages.map...))"
    const memoDef = "\n  const memoizedMessages = React.useMemo(() => " + mapStr.trim() + ", [messages, navigate]);\n\n";
    
    // Replace the JSX with {memoizedMessages}
    content = content.substring(0, startIdx) + "            {memoizedMessages}" + content.substring(endIdx + 7);
    
    // Insert memoDef before the main return
    const returnIdx = content.lastIndexOf("  return (");
    content = content.substring(0, returnIdx) + memoDef + content.substring(returnIdx);
    
    fs.writeFileSync(file, content);
    console.log("Safely extracted to memoizedMessages");
} else {
    console.log("Could not find start/end", startIdx, endIdx);
}
