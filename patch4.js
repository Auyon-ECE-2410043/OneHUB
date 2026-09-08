const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

code = code.replace(
  '        </div>\r\n      </div>\r\n      \r\n      </div>\r\n      <div className="w-full lg:w-[360px] shrink-0">\r\n        <LiveSidebar />\r\n      </div>\r\n      </div>\r\n    </motion.div>',
  '        </div>\r\n\r\n        {/* Right Live Sidebar */}\r\n        <div className="w-full lg:w-[360px] shrink-0">\r\n          <LiveSidebar />\r\n        </div>\r\n\r\n      </div>\r\n      \r\n    </motion.div>'
);

// Fallback if \n is used instead of \r\n
code = code.replace(
  '        </div>\n      </div>\n      \n      </div>\n      <div className="w-full lg:w-[360px] shrink-0">\n        <LiveSidebar />\n      </div>\n      </div>\n    </motion.div>',
  '        </div>\n\n        {/* Right Live Sidebar */}\n        <div className="w-full lg:w-[360px] shrink-0">\n          <LiveSidebar />\n        </div>\n\n      </div>\n      \n    </motion.div>'
);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', code);
console.log("Patched 4");
