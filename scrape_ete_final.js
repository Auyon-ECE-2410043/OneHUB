const mongoose = require('mongoose');
const cheerio = require('cheerio');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchTeacherList() {
    console.log("Fetching ETE teacher list...");
    const res = await fetch('https://www.ete.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const rows = [];
    $('table tbody tr').each((i, el) => {
        const tds = $(el).find('td').map((j, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
        let img = $(el).find('img').attr('src');
        if (img && !img.startsWith('http')) img = 'https://www.ete.ruet.ac.bd' + (img.startsWith('/') ? '' : '/') + img;
        rows.push({ tds, img });
    });
    
    return rows;
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const rows = await fetchTeacherList();
    console.log(`Found ${rows.length} profiles to process.`);

    // Purge existing ETE faculty to avoid duplicates
    await User.deleteMany({ department: 'ETE', role: 'faculty' });
    console.log("Purged existing ETE faculty data.");
    
    const results = [];
    for (const row of rows) {
        if (row.tds.length < 6) continue;

        const name = row.tds[1] || "";
        const nameBengali = row.tds[2] || "";
        let designationRaw = row.tds[3] || "Lecturer";
        let email = row.tds[5] || "";
        const phone = row.tds[6] || "";
        const photoUrl = row.img || null;
        
        if (!email) {
            email = name.toLowerCase().replace(/[^a-z]/g, '') + '@ete.ruet.ac.bd';
        }

        let isPhdHolder = false;
        let finalDesignation = "Lecturer";
        let desigLower = designationRaw.toLowerCase();
        
        if (name.toLowerCase().includes('dr.') || name.toLowerCase().includes('ph.d') || desigLower.includes('dr.')) {
            isPhdHolder = true;
        }
        
        if (desigLower.includes('professor') && !desigLower.includes('associate') && !desigLower.includes('assistant')) {
            finalDesignation = "Professor";
        } else if (desigLower.includes('associate professor')) {
            finalDesignation = "Associate Professor";
        } else if (desigLower.includes('assistant professor')) {
            finalDesignation = "Assistant Professor";
        } else if (desigLower.includes('lecturer')) {
            finalDesignation = "Lecturer";
        } else {
            finalDesignation = "Lecturer"; // fallback
        }

        if (name.toLowerCase() === "abdulla al suman") {
            finalDesignation = "Retired Faculty";
        }

        let isHeadOfDept = false;
        if (name.toLowerCase().includes('kamal hosain') || designationRaw.toLowerCase().includes('head')) {
            isHeadOfDept = true;
        }

        results.push({
            name,
            nameBengali,
            email,
            phone,
            designation: finalDesignation,
            isPhdHolder,
            isHeadOfDept,
            photoUrl
        });
    }

    console.log("\nSummary of Designations:");
    const counts = {};
    results.forEach(r => counts[r.designation] = (counts[r.designation] || 0) + 1);
    console.log(counts);

    let phdCount = results.filter(r => r.isPhdHolder).length;
    console.log(`Total PhD Holders: ${phdCount}`);
    
    // Save to DB
    let added = 0;
    const salt = await bcrypt.genSalt(10);
    
    for (const profile of results) {
        if (!profile.name || !profile.email) continue;
        
        const passwordHash = await bcrypt.hash("ruet123", salt);
        
        const u = new User({
            name: profile.name,
            nameBengali: profile.nameBengali,
            email: profile.email,
            passwordHash,
            role: 'faculty',
            department: 'ETE',
            designation: profile.designation,
            phone: profile.phone || "",
            isPhdHolder: profile.isPhdHolder,
            isHeadOfDept: profile.isHeadOfDept,
            photoUrl: profile.photoUrl,
            isFirstLogin: true
        });
        await u.save();
        added++;
    }

    console.log(`Done. Added: ${added}`);
    process.exit(0);
}

run();
