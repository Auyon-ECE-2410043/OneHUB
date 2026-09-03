const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust path as necessary if placed in root
require('dotenv').config();

const url = 'https://www.ece.ruet.ac.bd/teacher';
const baseURL = 'https://www.ece.ruet.ac.bd';

async function seedFaculty() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub");
    console.log("Connected to MongoDB...");

    console.log(`Fetching faculty data from ${url}...`);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const facultyList = [];
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    $('.our-team').each((i, el) => {
      const $el = $(el);
      
      const name = $el.find('.title a').text().trim();
      let designation = $el.find('.post').text().trim();
      let photoUrl = $el.find('.pic img').attr('src');
      const isOnLeave = $el.find('.ribbon-primary').text().trim().toLowerCase() === 'on leave';
      
      if (!name) return; // skip empty entries

      if (photoUrl && photoUrl.startsWith('/')) {
        photoUrl = baseURL + photoUrl;
      }
      
      if (designation === 'Head') {
        designation = 'Professor'; // Default to professor if it just says head
      }

      // Generate a dummy email and acronym based on name
      const nameParts = name.replace(/Prof\.|Dr\.|Md\.|Mst\.|Binte|Kumar/gi, '').trim().split(/\s+/);
      const acronym = nameParts.filter(p => p).map(p => p[0]).join('').toUpperCase().slice(0, 3);
      const rawEmailName = nameParts.filter(p => p).join('.').toLowerCase().replace(/[^a-z.]/g, '');
      const email = `${rawEmailName}@ece.ruet.ac.bd`;

      facultyList.push({
        name: name,
        email: email,
        passwordHash: defaultPasswordHash,
        role: "faculty",
        department: "ECE",
        designation: designation || "Lecturer",
        teacherAcronym: acronym || "TBD",
        photoUrl: photoUrl || null,
        isOnLeave: isOnLeave,
        isHeadOfDept: $el.find('.post').text().trim() === 'Head',
      });
    });

    console.log(`Found ${facultyList.length} faculty members.`);

    // Check if faculty already exist and upsert
    let added = 0;
    for (const faculty of facultyList) {
      const existing = await User.findOne({ email: faculty.email });
      if (!existing) {
        await User.create(faculty);
        added++;
      } else {
        await User.updateOne({ email: faculty.email }, { $set: faculty });
      }
    }

    console.log(`Successfully added/updated ${facultyList.length} faculty members! (${added} new)`);
    
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");

  } catch (error) {
    console.error("Error scraping and seeding faculty:", error);
    process.exit(1);
  }
}

seedFaculty();
