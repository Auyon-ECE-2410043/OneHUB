const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const profs = await User.find({ department: 'CSE' });
  console.log(`Found ${profs.length} total in CSE`);
  const heads = await User.find({ department: 'CSE', isHeadOfDept: true });
  console.log(`Found ${heads.length} heads in CSE`);
  if(heads.length > 0) {
      console.log('Head is:', heads[0].name, 'Role:', heads[0].role, 'Designation:', heads[0].designation);
  }
  
  const allProfs = profs.filter(p => p.designation === 'Professor');
  console.log(`Professors count: ${allProfs.length}`);
  allProfs.forEach(p => console.log(' -', p.name, 'role:', p.role, 'isHead:', p.isHeadOfDept));
  process.exit(0);
}
run();
