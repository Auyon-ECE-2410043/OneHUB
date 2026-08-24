const mongoose = require('mongoose');
const cheerio = require('cheerio');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const retiredNames = [
    'Khan Md. Ariful Haque'
];

async function fetchTeacherListLinks() {
    console.log("Fetching IPE teacher list...");
    const res = await fetch('https://www.ipe.ruet.ac.bd/teacher_list');
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const rows = [];
    $('table tbody tr').each((i, el) => {
        const tds = $(el).find('td').map((j, td) => $(td).text().replace(/\s+/g, ' ').trim()).get();
        let img = $(el).find('img').attr('src');
        if (img && !img.startsWith('http')) img = 'https://www.ipe.ruet.ac.bd' + (img.startsWith('/') ? '' : '/') + img;
        const href = $(el).find('a').attr('href');
        
        if (tds.length >= 6) {
            rows.push({ tds, img, href });
        }
    });
    
    return rows;
}

async function scrapeProfileDetails(url) {
    if (!url) return { education: [], fieldOfResearch: [], positionHistory: [] };

    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        const education = [];
        const eduHeader = $('h4').filter((i, el) => $(el).text().trim() === 'Education');
        if (eduHeader.length > 0) {
            eduHeader.next('ul.timeline').find('li').each((i, el) => {
                const degree = $(el).find('.designation').text().trim();
                const year = $(el).find('.date').text().trim();
                const institution = $(el).find('p').text().trim();
                if (degree) {
                    education.push({ degree, year, institution });
                }
            });
        }

        const fieldOfResearch = [];
        const resHeader = $('h5').filter((i, el) => $(el).text().trim().toLowerCase().includes('research'));
        if (resHeader.length > 0) {
            resHeader.next('ul').find('li').each((i, el) => {
                const topic = $(el).text().trim();
                if (topic) {
                    fieldOfResearch.push(topic);
                }
            });
        }

        const positionHistory = [];
        const posHeader = $('h4').filter((i, el) => $(el).text().trim() === 'Position');
        if (posHeader.length > 0) {
            posHeader.next('ul.timeline').find('li').each((i, el) => {
                const role = $(el).find('.designation').text().trim();
                const duration = $(el).find('.date').text().replace(/\s+/g, ' ').trim();
                const institution = $(el).find('p').map((j, p) => $(p).text().trim()).get().join(', ');
                if (role) {
                    positionHistory.push({ role, duration, institution });
                }
            });
        }

        return { education, fieldOfResearch, positionHistory };
    } catch (e) {
        console.log(`Failed to scrape ${url}`, e.message);
        return { education: [], fieldOfResearch: [], positionHistory: [] };
    }
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const rows = await fetchTeacherListLinks();
    console.log(`Found ${rows.length} IPE profiles in table.`);

    // Purge existing IPE faculty to avoid duplicates
    await User.deleteMany({ department: 'IPE', role: 'faculty' });
    console.log("Purged existing IPE faculty data.");
    
    const results = [];
    for (const row of rows) {
        const name = row.tds[1] || "";
        const nameBengali = row.tds[2] || "";
        let designationRaw = row.tds[3] || "Lecturer";
        let email = row.tds[5] || "";
        const phone = row.tds[6] || "";
        const officeLocation = row.tds[7] || ""; // Include Office Location
        const photoUrl = row.img || null;
        const href = row.href;
        
        if (!email) {
            email = name.toLowerCase().replace(/[^a-z]/g, '') + '@ipe.ruet.ac.bd';
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
        }

        // Exact match checking for retired
        const isRetired = retiredNames.some(rn => name.toLowerCase().trim() === rn.toLowerCase().trim());
        if (isRetired) {
            finalDesignation = "Retired Faculty";
        }

        let isHeadOfDept = false;
        if (name.toLowerCase().includes('asadujjaman') || designationRaw.toLowerCase().includes('head')) {
            isHeadOfDept = true;
        }

        // Fetch deep details
        const details = await scrapeProfileDetails(href);

        results.push({
            name,
            nameBengali,
            email,
            phone,
            officeLocation,
            designation: finalDesignation,
            isPhdHolder,
            isHeadOfDept,
            photoUrl,
            education: details.education,
            fieldOfResearch: details.fieldOfResearch,
            positionHistory: details.positionHistory
        });
    }

    console.log("\nSummary of Designations:");
    const counts = {};
    results.forEach(r => counts[r.designation] = (counts[r.designation] || 0) + 1);
    console.log(counts);

    let phdCount = results.filter(r => r.isPhdHolder && r.designation !== "Retired Faculty").length;
    console.log(`Active PhD Holders: ${phdCount}`);
    
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
            department: 'IPE',
            designation: profile.designation,
            phone: profile.phone || "",
            officeLocation: profile.officeLocation || "",
            isPhdHolder: profile.isPhdHolder,
            isHeadOfDept: profile.isHeadOfDept,
            photoUrl: profile.photoUrl,
            education: profile.education,
            fieldOfResearch: profile.fieldOfResearch,
            positionHistory: profile.positionHistory,
            isFirstLogin: true
        });
        await u.save();
        added++;
    }

    console.log(`Done. Added: ${added}`);
    process.exit(0);
}

run();
