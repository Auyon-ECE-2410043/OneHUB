const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const raw = fs.readFileSync('eee_corrected.json', 'utf8');
  const teachers = JSON.parse(raw);

  let updatedCount = 0;
  for (const t of teachers) {
    if (!t.name) continue;
    
    await User.updateOne(
      { name: t.name, department: 'EEE' },
      { $set: { designation: t.designation, photoUrl: t.photoUrl } }
    );
    updatedCount++;
    console.log(`Set ${t.name} -> ${t.designation}`);
  }
  
  console.log(`Updated ${updatedCount} teachers from JSON.`);
  process.exit(0);
}

run();
