const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
require('dotenv').config();

const User = require('./models/User');

const MONGODB_URI = process.env.MONGO_URI;
const CSV_FILE_PATH = "./ECE-25 Series Information List.csv";

const DEFAULT_PASSWORD_PREFIX = "ruet";

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const results = [];
  
  fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (data) => {
       results.push(data);
    })
    .on('end', async () => {
       console.log(`Parsed ${results.length} rows.`);
       
       let created = 0;
       let skipped = 0;

       for (const row of results) {
           const keys = Object.keys(row);
           const rollKey = keys.find(k => k.includes('Roll'));
           const rollNo = row[rollKey];
           
           if (!rollNo || rollNo.trim() === '') continue;
           
           const name = row['Student name (English)'];
           const nameBengali = row['Student name ( Bangla )'] || '';
           const genderTxt = row['Gender'];
           let email = row['E-mail'];
           let phone = row['Contact number'];
           const bloodGroupTxt = row['Blood group'];

           // Format Gender
           let gender = null;
           if (genderTxt && genderTxt.toLowerCase().includes('male')) {
               gender = genderTxt.toLowerCase() === 'female' ? 'Female' : 'Male';
           }

           // Clean up blood group
           let bloodGroup = "";
           if (bloodGroupTxt) {
               bloodGroup = bloodGroupTxt.replace(/\+ve/gi, '+').replace(/\-ve/gi, '-').replace(/\s/g, '').replace(/\(\+ve\)/gi, '+').replace(/\(\-ve\)/gi, '-').toUpperCase();
           }

           if (!email || email.trim() === '') {
               email = `${rollNo}@student.ruet.ac.bd`;
           }
           email = email.toLowerCase().trim();

           const existing = await User.findOne({ $or: [{ email: email }, { rollNo: rollNo.toString().trim() }] });
           if (existing) {
               skipped++;
               continue;
           }

           const salt = await bcrypt.genSalt(10);
           const passwordHash = await bcrypt.hash(`${DEFAULT_PASSWORD_PREFIX}${rollNo.toString().trim()}`, salt);
           
           let contactPhone = phone || "";
           if (contactPhone.length === 10 && contactPhone.startsWith('1')) {
               contactPhone = '0' + contactPhone;
           }

           const student = new User({
               name: name.trim(),
               nameBengali: nameBengali.trim(),
               rollNo: rollNo.toString().trim(),
               email: email,
               passwordHash,
               role: 'student',
               department: 'ECE',
               batch: '25',
               gender,
               phone: contactPhone,
               bloodGroup
           });

           await student.save();
           created++;
       }

       console.log(`\nDone! Created ${created} ECE 25-series students. Skipped ${skipped}.`);
       process.exit(0);
    });
}

run();
