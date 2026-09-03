const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');

  const fac = {
      name: 'Dr. Md. Shahid Uz Zaman',
      profileLink: 'http://cse.ruet.ac.bd/szaman22ruet',
      designation: 'Professor'
  };

  const newFac = {
      name: fac.name,
      designation: fac.designation,
      isHeadOfDept: true,
      isOnLeave: false,
      photoUrl: '',
      department: 'CSE',
      role: 'faculty',
      email: 'szaman22.ruet@gmail.com', 
      passwordHash: 'placeholder',
      fieldOfResearch: [],
      education: [],
      positionHistory: [],
      officeLocation: '',
      firstJoined: '',
      nameBengali: ''
  };

  try {
      console.log(`Fetching ${fac.name}...`);
      const res = await fetch(fac.profileLink);
      const html = await res.text();
      const $ = cheerio.load(html);

      // get photo
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

      // 5. Experience
      $('#Experience ul li').each((i, el) => {
          const txt = $(el).text().trim().replace(/\s+/g, ' ');
          if (txt.length > 5) {
              newFac.positionHistory.push({ role: txt, duration: '', institution: '' });
          }
      });
      
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

  newFac.isPhdHolder = newFac.name.toLowerCase().includes('dr.');

  // If he already exists, delete him to replace
  await User.deleteMany({ name: newFac.name });
  
  await User.create(newFac);
  console.log(`Saved ${newFac.name} successfully as Head.`);
  process.exit(0);
}
run();
