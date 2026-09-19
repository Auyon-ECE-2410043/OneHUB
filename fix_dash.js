const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/dashboard/Dashboard.jsx", "utf8");
let start = c.indexOf("                {/* ADMIN MODULE ACCESS CONTROL */}");
let end = c.indexOf("                          onClick={() => handleToggleFeature(f.key)}");
let replacement = `                {/* ADMIN MODULE ACCESS CONTROL */}
              {user?.role === "admin" && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Module Access Control</h3>
                    <p className="text-xs text-slate-500">Toggle features across the portal.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "routine", label: "Routine" },
                      { key: "courses", label: "Courses" },
                      { key: "registration", label: "Registration" },
                      { key: "attendance", label: "Attendance" },
                      { key: "marks", label: "Marks" },
                      { key: "cgpa", label: "CGPA" },
                      { key: "fees", label: "Fees" },
                      { key: "hall", label: "Hall" },
                      { key: "dining", label: "Dining" },
                      { key: "medical", label: "Medical" },
                      { key: "notices", label: "Notices" },
                      { key: "faculty", label: "Faculty" },
                      { key: "calendar", label: "Calendar" },
                      { key: "clearance", label: "Clearance" },
                      { key: "ai", label: "StudyBuddy AI" },
                      { key: "obe", label: "OBE Engine" }
                    ].map(f => {
                      const isEnabled = features[f.key] !== false;
                      const isToggling = togglingFeature === f.key;
                      
                      return (
                        <button
                          key={f.key}
`;
c = c.substring(0, start) + replacement + c.substring(end);
fs.writeFileSync("frontend/src/pages/dashboard/Dashboard.jsx", c);
