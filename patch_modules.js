const fs = require('fs');
let code = fs.readFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', 'utf8');

const adminSection = `
              {user?.role === "admin" && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Module Access Control</h3>
                    <p className="text-xs text-slate-500">Toggle features across the portal.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'routine', label: 'Routine' },
                      { key: 'courses', label: 'Courses' },
                      { key: 'registration', label: 'Registration' },
                      { key: 'attendance', label: 'Attendance' },
                      { key: 'marks', label: 'Marks' },
                      { key: 'cgpa', label: 'CGPA' },
                      { key: 'fees', label: 'Fees' },
                      { key: 'hall', label: 'Hall' },
                      { key: 'medical', label: 'Medical' },
                      { key: 'notices', label: 'Notices' },
                      { key: 'faculty', label: 'Faculty' },
                      { key: 'calendar', label: 'Calendar' },
                      { key: 'clearance', label: 'Clearance' }
                    ].map(f => {
                      const isEnabled = features[f.key] !== false;
                      const isToggling = togglingFeature === f.key;
                      
                      return (
                        <button
                          key={f.key}
                          onClick={() => handleToggleFeature(f.key)}
                          disabled={isToggling}
                          className={\`p-3 rounded-xl border text-left transition-all relative overflow-hidden \${isEnabled ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-rose-200 dark:border-rose-900/30'}\`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={\`text-[10px] font-bold uppercase tracking-wider \${isEnabled ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500 dark:text-rose-400'}\`}>
                              {f.label}
                            </span>
                            <div className={\`w-6 h-3 rounded-full flex items-center p-0.5 transition-colors \${isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}\`}>
                              <div className={\`w-2 h-2 bg-white rounded-full shadow-sm transform transition-transform \${isEnabled ? 'translate-x-3' : 'translate-x-0'}\`} />
                            </div>
                          </div>
                          <div className={\`text-[10px] font-semibold \${isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-500'}\`}>
                            {isToggling ? 'Wait...' : isEnabled ? 'Active' : 'Disabled'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
`;

code = code.replace(
  '{/* FACULTY / ADMIN DASHBOARD METRICS */}', 
  '{/* FACULTY / ADMIN DASHBOARD METRICS */}\n' + adminSection
);

fs.writeFileSync('v:/Project/OneHUB/OneHUB/frontend/src/pages/dashboard/Dashboard.jsx', code);
console.log("Restored module access control!");
