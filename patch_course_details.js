const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/courses/CourseDetails.jsx", "utf8");

// Add useOutletContext
c = c.replace(
  "import { useParams, Link } from \"react-router-dom\";",
  "import { useParams, Link, useOutletContext } from \"react-router-dom\";"
);

// Add features hook
c = c.replace(
  "const [activeTab, setActiveTab] = useState(\"roster\");",
  "const { features = {} } = useOutletContext();\n  const isObeEnabled = features.obe !== false;\n  const [activeTab, setActiveTab] = useState(\"roster\");"
);

// Hide OBE Configuration Tab Button
c = c.replace(
  `<button\n              onClick={() => setActiveTab("obe")}`,
  `{isObeEnabled && (<button\n              onClick={() => setActiveTab("obe")}`
);

// Close the if condition on the OBE tab button
c = c.replace(
  `<span>OBE Configuration</span>\n            </button>`,
  `<span>OBE Configuration</span>\n            </button>)}`
);

// Note: Ensure the active tab defaults to roster if obe is disabled but activeTab is obe.
// A simpler way is to just wrap the CourseOBEProfile component.
c = c.replace(
  `{activeTab === "obe" && (`,
  `{isObeEnabled && activeTab === "obe" && (`
);

fs.writeFileSync("frontend/src/pages/courses/CourseDetails.jsx", c);
