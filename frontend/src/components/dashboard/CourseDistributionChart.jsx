import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export function CourseDistributionChart({ coursesData }) {
  const { theme } = useTheme();
  
  const data = useMemo(() => {
    if (!coursesData || !coursesData.courses) return [];
    
    let theory = 0;
    let sessional = 0;
    
    coursesData.courses.forEach(c => {
      if (c.type === 'theory') theory += c.credits;
      else sessional += c.credits;
    });

    return [
      { name: 'Theory Credits', value: theory, color: '#3b82f6' }, // sky-500
      { name: 'Sessional/Lab', value: sessional, color: '#6366f1' }, // indigo-500
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
