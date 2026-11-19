/**
 * File: CourseDistributionChart.jsx
 * Description: React component rendering the CourseDistributionChart UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export function CourseDistributionChart({ coursesData }) {
  const { theme } = useTheme();
  
  const data = useMemo(() => {
    if (!coursesData) return [];
    
    // Support coursesData.courses, coursesData.courseIds, or array directly
    const list = coursesData.courses || coursesData.courseIds || (Array.isArray(coursesData) ? coursesData : []);
    if (!Array.isArray(list) || list.length === 0) return [];
    
    let theory = 0;
    let sessional = 0;
    
    list.forEach(c => {
      // Credit: handle c.credit, c.credits, or numerical fallback
      const cred = Number(c.credit ?? c.credits ?? 0) || 0;
      // Type: handle c.courseType or c.type ('theory' vs 'sessional'/'lab')
      const typeStr = (c.courseType || c.type || "").toLowerCase();
      if (typeStr === 'theory') {
        theory += cred;
      } else {
        sessional += cred;
      }
    });

    return [
      { name: 'Theory Credits', value: Number(theory.toFixed(2)), color: '#3b82f6' }, // sky-500
      { name: 'Sessional/Lab', value: Number(sessional.toFixed(2)), color: '#6366f1' }, // indigo-500
    ].filter(d => d.value > 0);
  }, [coursesData]);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
        No course data available
      </div>
    );
  }

  const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: tooltipBg, 
              borderColor: tooltipBorder,
              borderRadius: '0.75rem',
              color: textColor,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            itemStyle={{ color: textColor }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            wrapperStyle={{ fontSize: '12px', color: textColor }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
