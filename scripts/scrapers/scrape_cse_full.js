const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  // Clear existing CSE teachers to avoid duplicates
  await User.deleteMany({ department: 'CSE' });
  console.log('Cleared existing CSE teachers.');

  const json = JSON.parse(fs.readFileSync('cse_teachers_parsed.json', 'utf8'));

  for (const fac of json) {
     const newFac = {
         name: fac.name,
         designation: fac.designation,
         isHeadOfDept: fac.isHeadOfDept,
         isOnLeave: fac.isOnLeave,
         photoUrl: fac.photoUrl,
         department: 'CSE',
         role: 'faculty',
         email: fac.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@cse.ruet.ac.bd', // fallback
         passwordHash: 'placeholder',
         fieldOfResearch: [],
         education: [],
         positionHistory: [],
         officeLocation: '',
         firstJoined: '',
         nameBengali: ''
     };

     if (fac.profileLink) {
         try {
           console.log(`Fetching ${fac.name}...`);
           const res = await fetch(fac.profileLink);
           const html = await res.text();
           const $ = cheerio.load(html);

           // 1. Email fallback, Phone
           $('ul.teacher_contact li').each((i, el) => {
              const txt = $(el).text().trim();
              if (txt.toLowerCase().includes('email:')) {
                  const emails = txt.replace(/.*Email:/i, '').split(',');
                  if (emails[0] && emails[0].includes('@')) {
                      newFac.email = emails[0].trim();
                  }
              }
              if (txt.toLowerCase().includes('phone:')) {
                  newFac.phone = txt.replace(/.*Phone:/i, '').split('Email:')[0].trim();
              }
              if (txt.toLowerCase().includes('room') || txt.toLowerCase().includes('office')) {
                  let cleanTxt = txt.replace(/Phone:.*|Email:.*|First Joined:.*/gi, '').trim();
                  cleanTxt = cleanTxt.replace(/^Room\s*No:?/i, '').trim();
                  if (cleanTxt.length > 3) newFac.officeLocation = cleanTxt;
              }
              if (txt.toLowerCase().includes('first joined')) {
                  let cleanTxt = txt.replace(/.*First Joined:?/i, '').replace(/Dept\..*/gi, '').trim();
                  if (cleanTxt.length > 3) newFac.firstJoined = cleanTxt;
              }
           });

           // 2. Name Bengali
           const bName = $('h2.title small').text().trim() || $('h3 small').text().trim();
           if (bName) newFac.nameBengali = bName;

           // 3. Field of Research
           $('h5').each((i, el) => {
              if ($(el).text().toLowerCase().includes('field of research')) {
                 $(el).next('ul').find('li').each((j, li) => {
                    const txt = $(li).text().trim().replace(/\s+/g, ' ');
                    if (txt.length > 3) newFac.fieldOfResearch.push(txt);
                 });
                 if (newFac.fieldOfResearch.length === 0) {
                     const text = $(el).next().text().trim().replace(/\s+/g, ' ');
                     if(text.length > 5) {
                        if (text.includes(',')) {
                            text.split(',').forEach(t => {
                               if(t.trim().length > 3) newFac.fieldOfResearch.push(t.trim());
                            });
                        } else {
                            newFac.fieldOfResearch.push(text);
                        }
                     }
                 }
              }
           });

           // 4. Education
           $('#Education ul li').each((i, el) => {
               const txt = $(el).text().trim().replace(/\s+/g, ' ');
               if (txt.length > 5) {
                   newFac.education.push({ degree: txt, institution: '', year: '' });
               }
           });

           // 5. Experience
           $('#Experience ul li').each((i, el) => {
               const txt = $(el).text().trim().replace(/\s+/g, ' ');
               if (txt.length > 5) {
                   newFac.positionHistory.push({ role: txt, duration: '', institution: '' });
               }
           });
           
           // If tabs are mapped by h4
           if (newFac.education.length === 0) {
               $('h4').each((i, el) => {
                   if ($(el).text().toLowerCase().includes('education')) {
                       $(el).next('ul').find('li').each((j, li) => {
                           const txt = $(li).text().trim().replace(/\s+/g, ' ');
                           if (txt.length > 5) newFac.education.push({ degree: txt, institution: '', year: '' });
                       });
                   }
                   if ($(el).text().toLowerCase().includes('experience')) {
                       $(el).next('ul').find('li').each((j, li) => {
                           const txt = $(li).text().trim().replace(/\s+/g, ' ');
                           if (txt.length > 5) newFac.positionHistory.push({ role: txt, duration: '', institution: '' });
                       });
                   }
               });
           }

         } catch(e) {
           console.error(`Failed ${fac.name}:`, e.message);
         }
     }

     // If no PhD is determined, check if name has Dr.
     newFac.isPhdHolder = newFac.name.toLowerCase().includes('dr.');

     await User.create(newFac);
     console.log(`Saved ${newFac.name} successfully.`);
  }

  // Set the first professor as Head just so they have one, unless we found an explicit one
  const headsCount = await User.countDocuments({ department: 'CSE', isHeadOfDept: true });
  if (headsCount === 0) {
     console.log("No Head found. We won't randomly assign one for safety.");
  }

  console.log('Finished fully syncing CSE department!');
  process.exit(0);
}
run();
