const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const json = JSON.parse(fs.readFileSync('cse_teachers_parsed.json', 'utf8'));
  // also add Head manually
  json.push({
      name: 'Dr. Md. Shahid Uz Zaman',
      profileLink: 'http://cse.ruet.ac.bd/szaman22ruet'
  });

  for (const fac of json) {
     if (!fac.profileLink) continue;
     
     try {
       const res = await fetch(fac.profileLink);
       const html = await res.text();
       const $ = cheerio.load(html);

       let positionHistory = [];

       // They use <h4 class="font_weight500 mb-3">Position</h4> followed by <ul>
       $('h4').each((i, el) => {
           const txt = $(el).text().trim().toLowerCase();
           if (txt === 'position' || txt.includes('experience')) {
               $(el).next('ul').find('li').each((j, li) => {
                   const role = $(li).find('.designation').text().trim();
                   const date = $(li).find('.date').text().trim().replace(/\s+/g, ' ');
                   const dept = $(li).find('p').eq(0).text().trim();
                   const inst = $(li).find('p').eq(1).text().trim();
                   
                   let fullRole = role;
                   if (dept) fullRole += ` - ${dept}`;
                   if (inst) fullRole += ` (${inst})`;
                   if (date) fullRole += ` [${date}]`;

                   if (!role) {
                       // fallback just get all text
                       const fallback = $(li).text().trim().replace(/\s+/g, ' ');
                       if (fallback.length > 5) positionHistory.push({ role: fallback, duration: '', institution: '' });
                   } else {
                       positionHistory.push({ role: fullRole, duration: date, institution: inst });
                   }
               });
           }
       });

       if (positionHistory.length > 0) {
           await User.updateOne(
              { name: fac.name, department: 'CSE' },
              { $set: { positionHistory } }
           );
           console.log(`Updated ${fac.name} - Positions: ${positionHistory.length}`);
       }

     } catch(e) {
       console.error(`Failed ${fac.name}:`, e.message);
     }
  }

  console.log('Finished updating CSE Positions!');
  process.exit(0);
}
run();
