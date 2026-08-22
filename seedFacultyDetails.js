const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path as necessary
require('dotenv').config();

const url = 'https://www.ece.ruet.ac.bd/teacher';
const baseURL = 'https://www.ece.ruet.ac.bd';

async function seedFacultyDetails() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub");
    console.log("Connected to MongoDB...");

    console.log(`Fetching main faculty list from ${url}...`);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const facultyLinks = {};
    $('.our-team').each((i, el) => {
      const $el = $(el);
      const name = $el.find('.title a').text().trim();
      const profileUrl = $el.find('.title a').attr('href');
      if (name && profileUrl) {
        facultyLinks[name] = profileUrl;
      }
    });

    console.log(`Found ${Object.keys(facultyLinks).length} profile links.`);

    const faculties = await User.find({ role: 'faculty' });
    
    for (const faculty of faculties) {
      const profileUrl = facultyLinks[faculty.name];
      if (!profileUrl) {
        console.log(`No profile URL found for ${faculty.name}, skipping...`);
        continue;
      }

      console.log(`Fetching details for ${faculty.name} from ${profileUrl}...`);
      try {
        const { data: profileData } = await axios.get(profileUrl);
        const $p = cheerio.load(profileData);

        // 1. Website
        const websiteLink = $p('ul.teacher_contact a[target="_website"]').attr('href');
        if (websiteLink) faculty.website = websiteLink;

        // 2. First Joined
        const joinedText = $p('ul.teacher_contact li:contains("First Joined:")').text();
        if (joinedText) {
          faculty.firstJoined = joinedText.replace('First Joined:', '').trim();
        }

        // 3. Field of Research
        const research = [];
        $p('ul.teacher_sp li').each((i, el) => {
          research.push($p(el).text().trim());
        });
        faculty.fieldOfResearch = research;

        // 4. Position History
        const positions = [];
        $p('.card.position_education h4:contains("Position")').next('ul.timeline').find('li').each((i, el) => {
          const role = $p(el).find('.designation').text().trim();
          const duration = $p(el).find('.date').text().trim();
          const institution = $p(el).find('p').last().text().trim(); // the last p tag usually has the university name
          
          if (role) {
            positions.push({ role, duration, institution });
          }
        });
        faculty.positionHistory = positions;

        // 5. Education
        const education = [];
        $p('.card.position_education h4:contains("Education")').next('ul.timeline').find('li').each((i, el) => {
          const degree = $p(el).find('.designation').text().trim();
          const year = $p(el).find('.date').text().trim();
          const institution = $p(el).find('p').last().text().trim();
          
          if (degree) {
            education.push({ degree, institution, year });
          }
        });
        faculty.education = education;

        // 6. Bengali Name
        const bengaliName = $p('h6.professor_name').text().trim();
        if (bengaliName) {
          faculty.nameBengali = bengaliName;
        }

        await faculty.save();
        console.log(`  -> Updated ${faculty.name}`);
        
      } catch (err) {
        console.error(`Failed to fetch or parse details for ${faculty.name}:`, err.message);
      }
    }

    console.log("Finished updating all faculty members.");
    await mongoose.disconnect();
    
  } catch (error) {
    console.error("Error updating faculty details:", error);
    process.exit(1);
  }
}

seedFacultyDetails();
