const mongoose = require('mongoose');
const cheerio = require('cheerio');
require('dotenv').config({ path: '../.env' }); // Adjusted to point to OneHUB/.env

// Assume running from scratch folder, or adjust model path
const User = require('../models/User');

const baseURL = 'https://www.eee.ruet.ac.bd';

async function seedEeeFaculty() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub");
    console.log("Connected to MongoDB...");

    console.log("Fetching main faculty list...");
    const mainRes = await fetch(`${baseURL}/teacher`);
    const mainHtml = await mainRes.text();
    const $ = cheerio.load(mainHtml);

    const facultyLinks = [];
    $('h3.title a').each((i, el) => {
      const name = $(el).text().trim();
      let profileUrl = $(el).attr('href');
      if (name && profileUrl) {
        if (!profileUrl.startsWith('http')) profileUrl = baseURL + profileUrl;
        facultyLinks.push({ name, profileUrl });
      }
    });

    console.log(`Found ${facultyLinks.length} profile links.`);

    let count = 0;
    for (const fac of facultyLinks) {
      console.log(`\nFetching ${fac.name} from ${fac.profileUrl}...`);
      try {
        const profRes = await fetch(fac.profileUrl);
        const profHtml = await profRes.text();
        const $p = cheerio.load(profHtml);

        // Name
        let name = $p('h2.title').first().text().trim() || fac.name;

        // Photo
        let photoUrl = $p('.teacher_photo img').attr('src') || $p('img.img-fluid').first().attr('src');
        if (photoUrl && !photoUrl.startsWith('http')) photoUrl = baseURL + photoUrl;

        // Designation
        let designationText = $p('h4').first().text().trim();
        let designationEnum = null;
        if (designationText.toLowerCase().includes('professor') && !designationText.toLowerCase().includes('assistant') && !designationText.toLowerCase().includes('associate')) designationEnum = 'Professor';
        else if (designationText.toLowerCase().includes('associate')) designationEnum = 'Associate Professor';
        else if (designationText.toLowerCase().includes('assistant')) designationEnum = 'Assistant Professor';
        else if (designationText.toLowerCase().includes('lecturer')) designationEnum = 'Lecturer';
        
        // Contact list
        let email = '';
        let phone = '';
        let website = '';
        
        $p('ul.teacher_contact li').each((i, el) => {
          const txt = $p(el).text().trim();
          if (txt.includes('Email:') || txt.includes('@')) {
            const potentialEmail = $p(el).text().replace('Email:', '').trim().split(/[\s,]+/)[0];
            if (potentialEmail.includes('@')) email = potentialEmail;
          }
          if (txt.includes('Phone:') || txt.includes('Mobile:')) {
            phone = $p(el).text().replace(/Phone:|Mobile:/g, '').trim().split(',')[0];
          }
        });
        
        $p('ul.teacher_contact a').each((i, el) => {
          const href = $p(el).attr('href');
          if (href && (href.includes('mailto:'))) {
            email = href.replace('mailto:', '').trim();
          } else if (href && $p(el).text().toLowerCase().includes('website')) {
            website = href;
          }
        });

        // Generate email if none found (fallback)
        if (!email) {
          email = fac.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@eee.ruet.ac.bd';
        }

        // Education
        const education = [];
        $p('.education-list li, .education-item').each((i, el) => {
          // Simplistic extraction if available
        });

        // Insert/Update DB
        const updateData = {
          name: name,
          email: email,
          department: "EEE",
          role: "faculty",
          designation: designationEnum,
          phone: phone,
          photoUrl: photoUrl,
          website: website,
          // random password hash for seeded accounts
          passwordHash: "$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        };

        await User.findOneAndUpdate(
          { email: email },
          updateData,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        count++;
        console.log(`Saved: ${name} (${email}) - ${designationEnum}`);
        
      } catch (e) {
        console.error(`Error fetching ${fac.name}: ${e.message}`);
      }
    }
    
    console.log(`\nSuccessfully saved ${count} EEE faculty members.`);
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedEeeFaculty();
