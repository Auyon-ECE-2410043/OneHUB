const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

code = code.replace(
  '<div className="flex flex-col lg:flex-row gap-8 items-stretch">\r\n      <div className="flex flex-col xl:flex-row gap-8 items-start">',
  '<div className="flex flex-col xl:flex-row gap-8 items-start">'
);
code = code.replace(
  '<div className="flex flex-col lg:flex-row gap-8 items-stretch">\n      <div className="flex flex-col xl:flex-row gap-8 items-start">',
  '<div className="flex flex-col xl:flex-row gap-8 items-start">'
);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', code);
console.log("Fixed duplicate wrapper!");
