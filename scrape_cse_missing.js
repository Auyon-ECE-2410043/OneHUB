const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const json = JSON.parse(fs.readFileSync('cse_47_teachers.json', 'utf8'));
  
  for (const fac of json) {
     const exists = await User.findOne({ name: fac.name, department: 'CSE' });
     if (exists) {
         console.log(`Skipping ${fac.name}, already in DB.`);
         continue;
     }

     console.log(`Fetching ${fac.name}...`);
     
     let designation = fac.designation;
     let isHeadOfDept = false;
     if (fac.name === 'Dr. Md. Shahid Uz Zaman') isHeadOfDept = true;

     // Some designations like "Professor & Head" need cleanup
     if (designation.toLowerCase().includes('assistant')) designation = 'Assistant Professor';
     else if (designation.toLowerCase().includes('associate')) designation = 'Associate Professor';
     else if (designation.toLowerCase().includes('professor')) designation = 'Professor';
     else if (designation.toLowerCase().includes('lecturer')) designation = 'Lecturer';
     else designation = 'Retired Faculty'; // Just in case, though the list doesn't say retired.

     const newFac = {
         name: fac.name,
         designation: designation,
         isHeadOfDept: isHeadOfDept,
         isOnLeave: fac.isOnLeave,
         photoUrl: '',
         department: 'CSE',
         role: 'faculty',
         email: fac.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@cse.ruet.ac.bd', // fallback
         passwordHash: 'placeholder',
         fieldOfResearch: [],
         education: [],
         positionHistory: [],
         officeLocation: '',
         firstJoined: '',
         nameBengali: '',
         isPhdHolder: fac.name.toLowerCase().includes('dr.')
     };

     if (fac.profileLink) {
         try {
           const res = await fetch(fac.profileLink);
           const html = await res.text();
           const $ = cheerio.load(html);

           const img = $('.profile-img img, .faculty_details img, .pic img').attr('src') || '';
           if (img && !img.startsWith('http')) {
              newFac.photoUrl = 'https://www.cse.ruet.ac.bd' + (img.startsWith('/') ? img : '/' + img);
           } else {
              newFac.photoUrl = img;
           }

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

           // 5. Positions (Experience)
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
                           if (fallback.length > 5) newFac.positionHistory.push({ role: fallback, duration: '', institution: '' });
                       } else {
                           newFac.positionHistory.push({ role: fullRole, duration: date, institution: inst });
                       }
                   });
               }
               
               // Alternative Education tab logic
               if (newFac.education.length === 0 && txt.includes('education')) {
                   $(el).next('ul').find('li').each((j, li) => {
                       const liTxt = $(li).text().trim().replace(/\s+/g, ' ');
                       if (liTxt.length > 5) newFac.education.push({ degree: liTxt, institution: '', year: '' });
                   });
               }
           });
         } catch(e) {
           console.error(`Failed parsing ${fac.name}:`, e.message);
         }
     }

     await User.create(newFac);
     console.log(`Saved ${newFac.name} successfully.`);
  }

  console.log('Finished fully syncing missing CSE department teachers!');
  process.exit(0);
}
run();
