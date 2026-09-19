const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const states = [
  "  const [input, setInput] = useState('');\n",
  "  const [loading, setLoading] = useState(false);\n",
  "  const [activeVideo, setActiveVideo] = useState(null);\n",
  "  const [videoSummary, setVideoSummary] = useState(null);\n",
  "  const [summarizing, setSummarizing] = useState(false);\n",
  "  const [selectedFile, setSelectedFile] = useState(null);\n",
  "  const fileInputRef = useRef(null);\n"
];

for (const state of states) {
    if (content.includes(state)) {
        content = content.replace(state, '');
    } else {
        console.log("Could not find:", state);
    }
}

const statesBlock = states.join("");
const insertAfter = "    ];\n  });\n";
content = content.replace(insertAfter, insertAfter + "\n" + statesBlock);

fs.writeFileSync(file, content);
console.log("Moved states safely!");
