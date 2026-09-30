const fs = require("fs");
let c = fs.readFileSync("frontend/src/routes/AppRoutes.jsx", "utf8");

c = c.replace(
  "import CGPAAnalytics from \"../pages/marks/CGPAAnalytics\";",
  "import CGPAAnalytics from \"../pages/marks/CGPAAnalytics\";\nimport CGPACalculator from \"../pages/cgpa/CGPACalculator\";"
);

c = c.replace(
  "<Route path=\"/cgpa\" element={<FeatureGuard featureKey=\"cgpa\" title=\"CGPA Analytics\"><CGPAAnalytics /></FeatureGuard>} />",
  "<Route path=\"/cgpa\" element={<FeatureGuard featureKey=\"cgpa\" title=\"CGPA Analytics\"><CGPAAnalytics /></FeatureGuard>} />\n        <Route path=\"/cgpa/calculator\" element={<FeatureGuard featureKey=\"cgpa\" title=\"CGPA Predictor\"><CGPACalculator /></FeatureGuard>} />"
);

fs.writeFileSync("frontend/src/routes/AppRoutes.jsx", c);
console.log("AppRoutes patched");
