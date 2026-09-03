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

       let fieldOfResearch = [];

       $('h5').each((i, el) => {
          if ($(el).text().toLowerCase().includes('field of research')) {
             $(el).next('ul').find('li').each((j, li) => {
                const txt = $(li).text().trim().replace(/\s+/g, ' ');
                if (txt.length > 3) fieldOfResearch.push(txt);
             });
             // fallback
             if (fieldOfResearch.length === 0) {
                 const text = $(el).next().text().trim().replace(/\s+/g, ' ');
                 if(text.length > 5) {
                    // split by comma if multiple
                    if (text.includes(',')) {
                        text.split(',').forEach(t => {
                           if(t.trim().length > 3) fieldOfResearch.push(t.trim());
                        });
                    } else {
                        fieldOfResearch.push(text);
                    }
                 }
             }
          }
       });

       if (fieldOfResearch.length > 0) {
           await User.updateOne(
              { name: fac.name, department: 'EEE' },
              { $set: { fieldOfResearch } }
           );
           console.log(`Updated ${fac.name} - Research: ${fieldOfResearch.length} fields`);
       }

     } catch(e) {
       console.error(`Failed ${fac.name}:`, e.message);
     }
  }

  console.log('Finished updating EEE Research Fields!');
  process.exit(0);
}
run();
