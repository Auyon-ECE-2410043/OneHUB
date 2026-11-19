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
    const rawList = coursesData.courses || coursesData.courseIds || (Array.isArray(coursesData) ? coursesData : []);
    const list = Array.isArray(rawList) ? rawList.filter(Boolean) : [];
    
    let theory = 0;
    let sessional = 0;
    
    list.forEach(c => {
      // If c is an ID string or doesn't have credit properties, ignore here
      if (!c || typeof c !== "object") return;

      const cred = Number(c.credit ?? c.credits ?? 0) || 0;
      const typeStr = (c.courseType || c.type || "").toLowerCase();
      const code = String(c.courseCode || c.code || "");
      const name = String(c.courseName || c.title || "").toLowerCase();
      
      // Determine if sessional:
      // 1. Explicitly marked sessional or lab in courseType/type
      // 2. Or title contains 'sessional', 'lab', 'practice', 'project'
      // 3. Or course code ends with an even digit (RUET standard: even = sessional, odd = theory)
      const lastDigitMatch = code.match(/(\d)(?=[^\d]*$)/);
      const isEvenLastDigit = lastDigitMatch ? parseInt(lastDigitMatch[1], 10) % 2 === 0 : false;
      const isSessional = typeStr.includes("sessional") || typeStr.includes("lab") ||
                          name.includes("sessional") || name.includes("lab") || name.includes("practice") || name.includes("project") ||
                          (typeStr !== "theory" && isEvenLastDigit);

      if (isSessional) {
        sessional += cred;
      } else {
        theory += cred;
      }
    });

    // If theory + sessional is 0, but totalCredit exists and is positive:
    const totalCredit = Number(coursesData.totalCredit) || (theory + sessional);
    if (theory === 0 && sessional === 0 && totalCredit > 0) {
      // Gracefully partition credits based on RUET standard ratio (~70% theory, 30% sessional)
      const estTheory = Number((totalCredit * 0.70).toFixed(2));
      const estSessional = Number((totalCredit - estTheory).toFixed(2));
      return [
        { name: 'Theory Credits', value: estTheory, color: '#3b82f6' },
        { name: 'Sessional/Lab', value: estSessional, color: '#6366f1' },
      ];
    }

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
