const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const html = fs.readFileSync('eee_teachers.html', 'utf8');
  const $ = cheerio.load(html);
  
  let updatedCount = 0;

  for (const el of $('h3.title a').toArray()) {
    const name = $(el).text().trim();
    const parent = $(el).closest('.row, .col-lg-3, .col-md-4, .single-member, .teacher-card, div[class*="col-"]');
    
    let photoUrl = parent.find('img').attr('src');
    if (photoUrl && !photoUrl.startsWith('http')) {
      photoUrl = 'https://www.eee.ruet.ac.bd' + (photoUrl.startsWith('/') ? '' : '/') + photoUrl;
    }

    let desigText = 'Professor';
    let prevH4 = parent.prevAll('h4').first();
    if (prevH4.length === 0) prevH4 = parent.parent().prevAll('h4').first();
    if (prevH4.length > 0) {
      const txt = prevH4.text().trim();
      if (txt.includes('Associate Professor')) desigText = 'Associate Professor';
      else if (txt.includes('Assistant Professor')) desigText = 'Assistant Professor';
      else if (txt.includes('Professor') || txt.includes('Head')) desigText = 'Professor';
      else if (txt.includes('Lecturer')) desigText = 'Lecturer';
    }

    await User.updateOne(
      { name: name, department: 'EEE' },
      { $set: { designation: desigText, photoUrl: photoUrl } }
    );
    updatedCount++;
  }
  
  console.log('Updated ' + updatedCount + ' teachers.');
  process.exit(0);
}
run();
