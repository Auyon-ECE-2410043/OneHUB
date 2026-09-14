const fs = require('fs');
const path = 'mobile/lib/screens/home_screen.dart';
let content = fs.readFileSync(path, 'utf-8');

const reps = [
  { title: 'Academic Calendar', flag: 'calendar' },
  { title: 'Notice Board', flag: 'notices' },
  { title: 'Faculty Directory', flag: 'faculty' },
  { title: 'Weekly Routine', flag: 'routine' },
  { title: 'My Courses', flag: 'courses' },
  { title: 'Attendance Record', flag: 'attendance' },
  { title: 'Marks & Grades', flag: 'marks' },
  { title: 'Clearance Status', flag: 'clearance' },
  { title: 'Medical Center', flag: 'medical' },
  { title: 'Hall Application', flag: 'hall' },
  { title: 'Course Catalog', flag: 'courses' },
  { title: 'Mark Attendance', flag: 'attendance' },
  { title: 'Enter Marks', flag: 'marks' },
  { title: 'Course Assignments', flag: 'courses' },
  { title: 'Manage Routine', flag: 'routine' },
  { title: 'Manage Calendar', flag: 'calendar' },
  { title: 'Fee Payment', flag: 'fees' },
  { title: 'Fee Management', flag: 'fees' },
  { title: 'Manage Clearances', flag: 'clearance' },
  { title: 'Hall Applications', flag: 'hall' }
];

reps.forEach(r => {
  const matchStr = `_buildModuleCard(
                      context, 
                      '${r.title}',`;
  const replaceStr = `if (_isFeatureEnabled('${r.flag}', role)) 
                    _buildModuleCard(
                      context, 
                      '${r.title}',`;
  content = content.split(matchStr).join(replaceStr);
});

fs.writeFileSync(path, content, 'utf-8');
console.log('Done mapping features');