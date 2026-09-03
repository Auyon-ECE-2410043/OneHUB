const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const html = fs.readFileSync('eee_teachers.html', 'utf8');
  const $ = cheerio.load(html);
  
  let currentDesignation = 'Professor';

  const elements = $('.container h4, .container .col-lg-3, .container .col-md-4');
  
  let updatedCount = 0;

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    
    if ($(el).is('h4')) {
      const text = $(el).text().trim();
      if (text.includes('Associate Professor')) currentDesignation = 'Associate Professor';
      else if (text.includes('Assistant Professor')) currentDesignation = 'Assistant Professor';
      else if (text.includes('Professor') || text.includes('Head')) currentDesignation = 'Professor';
      else if (text.includes('Lecturer')) currentDesignation = 'Lecturer';
    } else {
      const name = $(el).find('h3.title a').text().trim();
      if (!name) continue;
      
      let photoUrl = $(el).find('img').attr('src');
      if (photoUrl && !photoUrl.startsWith('http')) {
        photoUrl = 'https://www.eee.ruet.ac.bd' + (photoUrl.startsWith('/') ? '' : '/') + photoUrl;
      }

      await User.updateOne(
        { name: name, department: 'EEE' },
        { $set: { designation: currentDesignation, photoUrl: photoUrl } }
      );
      updatedCount++;
    }
  }
  
  console.log('Updated ' + updatedCount + ' teachers.');
  process.exit(0);
}
run();
