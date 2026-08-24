const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const results = [];
  fs.createReadStream('ECE-25 Series Information List.csv').pipe(csv())
    .on('data', d => results.push(d))
    .on('end', async () => {
      let count = 0;
      for (const row of results) {
        const keys = Object.keys(row);
        const rollKey = keys.find(k => k.includes('Roll'));
        const rollNo = row[rollKey];
        if (!rollNo || rollNo.trim() === '') continue;
        
        let email = row['E-mail'];
        if (!email || email.trim() === '') email = `${rollNo.trim()}@student.ruet.ac.bd`;
        email = email.toLowerCase().trim();
        
        const existing = await User.findOne({ $or: [{ email }, { rollNo: rollNo.trim() }] });
        if (existing) {
          console.log(`Skipped Student: Roll ${rollNo}, Email: ${email}`);
          console.log(`Matching DB Entry: Roll ${existing.rollNo}, Email: ${existing.email}, Name: ${existing.name}`);
        }
      }
      process.exit(0);
    });
}
run();
