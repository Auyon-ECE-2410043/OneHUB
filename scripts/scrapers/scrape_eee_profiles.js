const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const json = JSON.parse(fs.readFileSync('eee_teachers_parsed.json', 'utf8'));

  for (const fac of json) {
     if (!fac.profileLink) continue;
     
     try {
       const res = await fetch(fac.profileLink);
       const html = await res.text();
       const $ = cheerio.load(html);

       let education = [];
       let positionHistory = [];
       let email = fac.email || '';
       let phone = fac.phone || '';
       let website = fac.profileLink;

       $('ul.teacher_contact li').each((i, el) => {
          const txt = $(el).text().trim();
          if (txt.includes('Email:') || txt.includes('@')) {
            const potentialEmail = $(el).text().replace('Email:', '').trim().split(/[\s,]+/)[0];
            if (potentialEmail.includes('@')) email = potentialEmail;
          }
          if (txt.includes('Phone:') || txt.includes('Mobile:')) {
            phone = $(el).text().replace(/Phone:|Mobile:/g, '').trim().split(',')[0];
          }
       });

       $('h4').each((i, el) => {
          const title = $(el).text().trim().toLowerCase();
          if (title === 'education') {
             $(el).next('ul').find('li').each((j, li) => {
                const text = $(li).text().trim().replace(/\s+/g, ' ');
                if(text) education.push({ degree: text, institution: '', year: '' });
             });
             if (education.length === 0) {
                 const text = $(el).next().text().trim().replace(/\s+/g, ' ');
                 if(text.length > 5) education.push({ degree: text, institution: '', year: '' });
             }
          } else if (title === 'position' || title === 'experience') {
             $(el).next('ul').find('li').each((j, li) => {
                const text = $(li).text().trim().replace(/\s+/g, ' ');
                if(text) positionHistory.push({ role: text, duration: '', institution: '' });
             });
             if (positionHistory.length === 0) {
                 const text = $(el).next().text().trim().replace(/\s+/g, ' ');
                 if(text.length > 5) positionHistory.push({ role: text, duration: '', institution: '' });
             }
          }
       });

       const updateData = { website };
       if (education.length > 0) updateData.education = education;
       if (positionHistory.length > 0) updateData.positionHistory = positionHistory;
       if (email) updateData.email = email;
       if (phone) updateData.phone = phone;

       await User.updateOne(
          { name: fac.name, department: 'EEE' },
          { $set: updateData }
       );
       console.log(`Updated ${fac.name}`);

     } catch(e) {
       console.error(`Failed ${fac.name}:`, e.message);
     }
  }

  process.exit(0);
}
run();
