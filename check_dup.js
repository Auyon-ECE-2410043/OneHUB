const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const allEEE = await User.find({ department: 'EEE' });
  console.log('Total EEE Faculty:', allEEE.length);
  
  const names = {};
  let duplicates = 0;
  for (const f of allEEE) {
     if (names[f.name]) {
         duplicates++;
         console.log('Duplicate:', f.name);
     }
     names[f.name] = true;
  }
  console.log('Total Duplicates found:', duplicates);
  process.exit(0);
}
run();
