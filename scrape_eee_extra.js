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
     
     console.log(`Fetching extra details for ${fac.name}...`);
     try {
       const res = await fetch(fac.profileLink);
       const html = await res.text();
       const $ = cheerio.load(html);

       let officeLocation = '';
       let firstJoined = '';

       $('ul.teacher_contact li').each((i, el) => {
          const txt = $(el).text().trim();
          
          if (txt.toLowerCase().includes('room') || txt.toLowerCase().includes('office')) {
             // Extract something like "Room No. 10, 1st Floor, Academic Building 2"
             let cleanTxt = txt.replace(/Phone:.*|Email:.*|First Joined:.*/gi, '').trim();
             // Sometimes it prefixes "Room No:"
             cleanTxt = cleanTxt.replace(/^Room\s*No:?/i, '').trim();
             if (cleanTxt.length > 3) officeLocation = cleanTxt;
          }
          
          if (txt.toLowerCase().includes('first joined')) {
             let cleanTxt = txt.replace(/.*First Joined:?/i, '').replace(/Dept\..*/gi, '').trim();
             if (cleanTxt.length > 3) firstJoined = cleanTxt;
          }
       });

       const updateData = {};
       if (officeLocation) updateData.officeLocation = officeLocation;
       if (firstJoined) updateData.firstJoined = firstJoined;

       if (Object.keys(updateData).length > 0) {
           await User.updateOne(
              { name: fac.name, department: 'EEE' },
              { $set: updateData }
           );
           console.log(`Updated ${fac.name} - Room: ${officeLocation}, Joined: ${firstJoined}`);
       }

     } catch(e) {
       console.error(`Failed ${fac.name}:`, e.message);
     }
  }

  console.log('Finished updating extra EEE profile fields!');
  process.exit(0);
}
run();
