const fs = require('fs');
const path = 'frontend/src/pages/dashboard/Dashboard.jsx';
let content = fs.readFileSync(path, 'utf-8');

const regexes = [
  { match: /<Link\s+to="\/attendance"[\s\S]*?<\/Link>/, flag: 'attendance' },
  { match: /<Link\s+to="\/marks"[\s\S]*?<\/Link>/, flag: 'marks' },
  { match: /<Link\s+to="\/fees"[\s\S]*?<\/Link>/, flag: 'fees' },
  { match: /<Link\s+to="\/attendance\/mark"[\s\S]*?<\/Link>/, flag: 'attendance' },
  { match: /<Link\s+to="\/marks\/entry"[\s\S]*?<\/Link>/, flag: 'marks' }
];

regexes.forEach(r => {
  content = content.replace(r.match, (match) => {
    return '<>{features.' + r.flag + ' !== false && ( ' + match + ' )}</>';
  });
});

fs.writeFileSync(path, content, 'utf-8');
console.log('Done');