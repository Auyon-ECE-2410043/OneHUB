
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const raw = fs.readFileSync('eee_teachers_parsed.json', 'utf8');
  const teachers = JSON.parse(raw);
  for (const t of teachers) {
    let designationEnum = null;
    const txt = (t.desigText || '').toLowerCase();
    if (txt.includes('associate')) designationEnum = 'Associate Professor';
    else if (txt.includes('assistant')) designationEnum = 'Assistant Professor';
    else if (txt.includes('professor')) designationEnum = 'Professor';
    else if (txt.includes('lecturer')) designationEnum = 'Lecturer';
    if (!designationEnum) designationEnum = 'Assistant Professor';
    await User.updateOne({ name: t.name, department: 'EEE' }, { $set: { designation: designationEnum } });
  }
  console.log('Done!');
  process.exit(0);
}
run();

