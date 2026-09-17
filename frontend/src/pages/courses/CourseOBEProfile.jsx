import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Plus, Trash2, Save } from 'lucide-react';

export default function CourseOBEProfile({ courseId }) {
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState([]);
  const [cos, setCos] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [session, setSession] = useState('2023-2024');

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [outcomesRes, profileRes] = await Promise.all([
        api.get('/api/obe/outcomes'),
        api.get('/api/obe/course/' + courseId + '?session=' + session)
      ]);
      setPos(outcomesRes.data.outcomes.filter(o => o.type === 'PO'));
      setCos(profileRes.data.profile?.cos || []);
      setMappings(profileRes.data.profile?.mappings || []);
    } catch (err) {
      toast.error('Failed to load OBE profile');
    } finally {
      setLoading(false);
    }
  };

  const addCO = () => {
    setCos([...cos, { code: 'CO' + (cos.length + 1), description: '', bloomLevels: [] }]);
  };

  const updateCO = (index, field, value) => {
    const newCos = [...cos];
    newCos[index][field] = value;
    setCos(newCos);
  };

  const removeCO = (index) => {
    const newCos = [...cos];
    newCos.splice(index, 1);
    setCos(newCos);
  };

  const updateMapping = (coCode, poCode, level) => {
    let newMappings = [...mappings];
    const existingIndex = newMappings.findIndex(m => m.coCode === coCode && m.poCode === poCode);
    
    if (level === 0 || level === '0') {
      if (existingIndex > -1) newMappings.splice(existingIndex, 1);
    } else {
      if (existingIndex > -1) {
        newMappings[existingIndex].correlationLevel = Number(level);
      } else {
        newMappings.push({ coCode, poCode, correlationLevel: Number(level) });
      }
    }
    setMappings(newMappings);
  };

  const getMappingLevel = (coCode, poCode) => {
    const mapping = mappings.find(m => m.coCode === coCode && m.poCode === poCode);
    return mapping ? mapping.correlationLevel : 0;
  };

  const saveProfile = async () => {
    try {
      await api.post('/api/obe/course/' + courseId, {
        session,
        cos,
        mappings
      });
      toast.success('Course OBE Profile saved successfully');
    } catch (err) {
      toast.error('Failed to save profile');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading OBE Data...</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mt-6 space-y-8">
      {/* Course Outcomes Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-800">Course Outcomes (COs)</h3>
          <button onClick={addCO} className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4"/> Add CO
          </button>
        </div>
        <div className="space-y-3">
          {cos.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No Course Outcomes defined yet.</p>
          ) : (
            cos.map((co, idx) => (
              <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <input
                  type="text"
                  value={co.code}
                  onChange={(e) => updateCO(idx, 'code', e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700"
                  placeholder="CO1"
                />
                <textarea
                  value={co.description}
                  onChange={(e) => updateCO(idx, 'description', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 resize-none h-10"
                  placeholder="e.g., Describe the basic concepts and applications of database systems."
                />
                <button onClick={() => removeCO(idx)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-5 h-5"/>
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CO-PO Mapping Matrix */}
      <section>
        <h3 className="font-bold text-lg text-slate-800 mb-4">CO-PO Mapping Matrix</h3>
        <p className="text-sm text-slate-500 mb-4">Select the correlation level (1=Low, 2=Medium, 3=High) for each mapping.</p>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 border-r border-slate-200">CO</th>
                {pos.map(po => (
                  <th key={po.code} className="p-3 text-center border-r border-slate-200 font-semibold" title={po.title}>
                    {po.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cos.map(co => (
                <tr key={co.code} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-700">{co.code}</td>
                  {pos.map(po => (
                    <td key={po.code} className="p-2 border-r border-slate-200 text-center">
                      <select
                        value={getMappingLevel(co.code, po.code)}
                        onChange={(e) => updateMapping(co.code, po.code, e.target.value)}
                        className={`w-full text-center bg-transparent focus:outline-none font-medium ${getMappingLevel(co.code, po.code) > 0 ? 'text-sky-600' : 'text-slate-300'}`}
                      >
                        <option value={0}>-</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
              {cos.length === 0 && (
                <tr>
                  <td colSpan={pos.length + 1} className="p-6 text-center text-slate-400">Add Course Outcomes above to map them.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button onClick={saveProfile} className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-colors">
          <Save className="w-5 h-5"/> Save OBE Profile
        </button>
      </div>
    </div>
  );
}