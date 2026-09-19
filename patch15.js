const fs = require('fs');
const file = 'frontend/src/pages/ai/StudyBuddy.jsx';
let content = fs.readFileSync(file, 'utf8');

const s1 = "  const [input, setInput] = useState('');\r\n";
const s2 = "  const [loading, setLoading] = useState(false);\r\n";
const s3 = "  const [activeVideo, setActiveVideo] = useState(null);\r\n";
const s4 = "  const [videoSummary, setVideoSummary] = useState(null);\r\n";
const s5 = "  const [summarizing, setSummarizing] = useState(false);\r\n";
const s6 = "  const [selectedFile, setSelectedFile] = useState(null);\r\n";
const s7 = "  const fileInputRef = useRef(null);\r\n";

content = content.replace(s1, '').replace(s2, '').replace(s3, '').replace(s4, '').replace(s5, '').replace(s6, '').replace(s7, '');

const allStates = s1 + s2 + s3 + s4 + s5 + s6 + s7;

const insertStr = "    ];\r\n  });\r\n";
content = content.replace(insertStr, insertStr + "\n" + allStates);

fs.writeFileSync(file, content);
console.log("Moved states successfully!");
