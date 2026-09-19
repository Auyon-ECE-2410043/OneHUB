const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = "{messages.map((msg, idx) => (";
const replacementStr = "{React.useMemo(() => messages.map((msg, idx) => (";

const targetEndStr = "            {/* Input Area */}";
// We need to find where the map ends. It ends at:
//         </div>
//     ))}
//   </div>
//   {/* Input Area */}
// 
// So we want to replace     ))}    </div> with     ))), [messages])}    </div>

content = content.replace("{messages.map((msg, idx) => (", "{React.useMemo(() => messages.map((msg, idx) => (");
content = content.replace("     ))}              </div>", "     ))), [messages])}              </div>");

// More reliable replacement:
// Find the exact block.
