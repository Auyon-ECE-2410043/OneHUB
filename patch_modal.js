const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/components/dashboard/LiveFeedPostModal.jsx', 'utf8');

// 1. Add createPortal to imports
code = code.replace(
  'import { useState } from "react";',
  'import { useState } from "react";\nimport { createPortal } from "react-dom";'
);

// 2. Wrap the return in createPortal
const returnRegex = /return \(\s*<AnimatePresence>([\s\S]*?)<\/AnimatePresence>\s*\);/;
code = code.replace(
  returnRegex,
  `return createPortal(
    <AnimatePresence>
      $1
    </AnimatePresence>,
    document.body
  );`
);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/components/dashboard/LiveFeedPostModal.jsx', code);
console.log("Patched modal with portal!");
