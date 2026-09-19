const fs = require('fs');
const file = 'frontend/src/pages/dashboard/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [activeUsers, setActiveUsers]')) {
    content = content.replace(
        "const [hallApplications, setHallApplications] = useState([]);", 
        "const [hallApplications, setHallApplications] = useState([]);\n  const [activeUsers, setActiveUsers] = useState([]);"
    );
    fs.writeFileSync(file, content);
    console.log("Added activeUsers state");
} else {
    console.log("activeUsers state already exists?!");
}
