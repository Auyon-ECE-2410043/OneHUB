const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const res = await fetch('http://eee.ruet.ac.bd/teacher');
  const html = await res.text();
  const $ = cheerio.load(html);

  const retired = [];
  $('.faculty_details').each((i, el) => {
      // Find what section it's under
      let isRetired = false;
      const prev = $(el).closest('.row').prev().text().toLowerCase();
      const parent = $(el).closest('.col-12').prev().text().toLowerCase();
      // Or just look for any tag before it
      // Actually, let's just parse all and check if they're in the Retired Faculty list
      // Wait, in EEE the retired faculty have "Retired" or something?
  });

  // Since I know their names from earlier, I can just re-scrape all and if they don't match the active list...
  // Let's just find the retired faculty header and get all next cards.
  const allFacs = [];
  let currentGroup = '';
  $('*').each((i, el) => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'h3' || tag === 'h2' || tag === 'h4' || $(el).hasClass('section-title')) {
          const t = $(el).text().trim();
          if(t) currentGroup = t;
      }
      if ($(el).hasClass('faculty_details') || $(el).hasClass('our-team') || $(el).hasClass('teacher-item')) {
          const name = $(el).find('h5.text-primary, h3.title a').text().trim();
          const pLink = $(el).find('.view_profile_btn a, h3.title a').attr('href');
          let photoUrl = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
          if (photoUrl && !photoUrl.startsWith('http')) {
              photoUrl = 'https://www.eee.ruet.ac.bd' + (photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl);
          }
          if (name && currentGroup.toLowerCase().includes('retired')) {
              retired.push({ name, profileLink: pLink, photoUrl, department: 'EEE' });
          }
      }
  });

  console.log(`Found ${retired.length} retired EEE teachers.`);

  for (const fac of retired) {
      // Just create them with basic info, we won't deep scrape unless asked to save time
      try {
          await User.deleteMany({ name: fac.name, department: 'EEE' });
          await User.create({
              name: fac.name,
              designation: 'Retired Faculty',
              department: 'EEE',
              role: 'faculty',
              email: fac.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@eee.ruet.ac.bd',
              passwordHash: 'placeholder',
              photoUrl: fac.photoUrl,
              isHeadOfDept: false,
              isOnLeave: false,
              fieldOfResearch: [], education: [], positionHistory: [], officeLocation: '', firstJoined: '', nameBengali: ''
          });
          console.log('Restored EEE retired:', fac.name);
      } catch(e) {
          console.log('Error:', e.message);
      }
  }

  console.log('Done restoring EEE.');
  process.exit(0);
}
run();
