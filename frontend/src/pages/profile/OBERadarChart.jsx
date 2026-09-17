import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../services/api';
import { Target } from 'lucide-react';

export default function OBERadarChart({ studentId = 'me' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/obe/student/${studentId}/radar`);
        setData(res.data.radarData || []);
      } catch (err) {
        console.error('Failed to fetch OBE radar data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Skill Radar...</div>;
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Target className="w-5 h-5 text-sky-600"/>
          <h3 className="font-bold text-base text-slate-800">Outcome Attainment (OBE)</h3>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-slate-300"/>
          </div>
          <h4 className="font-bold text-slate-700 mb-1">No Skill Data Yet</h4>
          <p className="text-sm text-slate-500 max-w-sm">Your Outcome-Based Education (OBE) radar chart will appear here once your teachers enter exam marks mapped to Course Outcomes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <Target className="w-5 h-5 text-sky-600"/>
        <h3 className="font-bold text-base text-slate-800">Outcome Attainment (OBE)</h3>
      </div>
      <div className="p-6 flex justify-center">
        <div className="w-full max-w-md h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e58f" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{fill: '#64748b', fontSize: 12}} 
              />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                formatter={(value) => [`${value}%`, 'Attainment']}
              />
              <Radar 
                name="Outcome Attainment"
                dataKey="A" 
                stroke="#0284c7" 
                fill="#38bdf8" 
                fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
