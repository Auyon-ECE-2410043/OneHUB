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
    
    const links = [];
    $('table tbody tr').each((i, el) => {
        const anchor = $(el).find('a').first();
        const href = anchor.attr('href');
        if (href) links.push(href);
    });
    
    return links;
}

async function scrapeProfile(url) {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const name = $('.profile-details h2').text().trim() || $('.card-body h2').first().text().trim() || $('h2.text-center').text().trim() || $('h3').first().text().trim();
    
    let photoUrl = $('.profile-img img').attr('src') || $('.card-img-top').attr('src') || $('img.img-thumbnail').attr('src') || $('img.profile-user-img').attr('src');
    if (photoUrl && photoUrl.startsWith('/')) {
        photoUrl = 'https://www.ete.ruet.ac.bd' + photoUrl;
    }

    const designation = $('.profile-details h4').first().text().trim() || $('h4').first().text().trim();
    
    let email = '';
    let phone = '';
    
    // Attempt to find email and phone in typical elements
    $('p, div, li, span, td').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('@') && text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
            const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if(match) email = match[0].toLowerCase();
        }
        if (text.toLowerCase().includes('phone') || text.toLowerCase().includes('mobile') || text.match(/(?:\+880|880|01)[0-9]{8,9}/)) {
            const match = text.match(/(?:\+880|880|01)[0-9]{8,9}/);
            if (match) phone = match[0];
        }
    });

    if (!email) {
        // Generate placeholder email if not found
        email = name.toLowerCase().replace(/[^a-z]/g, '') + '@ete.ruet.ac.bd';
    }

    let isPhdHolder = false;
    let finalDesignation = "Lecturer";
    let desigLower = designation.toLowerCase();
    
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
        // Fallback checks via page text
        const pageText = $('body').text().toLowerCase();
        if (pageText.includes('dr.') || pageText.includes('phd')) isPhdHolder = true;
        
        if (pageText.includes('associate professor')) finalDesignation = "Associate Professor";
        else if (pageText.includes('assistant professor')) finalDesignation = "Assistant Professor";
        else if (pageText.includes('professor')) finalDesignation = "Professor";
        else finalDesignation = "Lecturer";
    }

    let isHeadOfDept = false;
    if (name.toLowerCase().includes('kamal hosain') || designation.toLowerCase().includes('head')) {
        isHeadOfDept = true;
    }

    return {
        name,
        email,
        phone,
        designation: finalDesignation,
        isPhdHolder,
        isHeadOfDept,
        photoUrl
    };
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const links = await fetchTeacherList();
    console.log(`Found ${links.length} profiles to scrape.`);
    
    const results = [];
    for (const url of links) {
        try {
            const profile = await scrapeProfile(url);
            results.push(profile);
            console.log(`Scraped: ${profile.name} | ${profile.designation} | PhD: ${profile.isPhdHolder} | ${profile.email}`);
        } catch(e) {
            console.error(`Failed to scrape ${url}`, e);
        }
    }

    console.log("\nSummary of Designations:");
    const counts = {};
    results.forEach(r => counts[r.designation] = (counts[r.designation] || 0) + 1);
    console.log(counts);

    let phdCount = results.filter(r => r.isPhdHolder).length;
    console.log(`Total PhD Holders: ${phdCount}`);
    
    // Save to DB
    let added = 0;
    let skipped = 0;
    const salt = await bcrypt.genSalt(10);
    
    for (const profile of results) {
        if (!profile.name || !profile.email) continue;
        
        const existing = await User.findOne({ email: profile.email });
        if (existing) {
            // Update their role and dept just in case
            existing.role = 'faculty';
            existing.department = 'ETE';
            existing.designation = profile.designation;
            existing.isPhdHolder = profile.isPhdHolder;
            existing.isHeadOfDept = profile.isHeadOfDept;
            if(profile.photoUrl) existing.photoUrl = profile.photoUrl;
            await existing.save();
            skipped++;
            continue;
        }

        const passwordHash = await bcrypt.hash("ruet123", salt);
        
        const u = new User({
            name: profile.name,
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

    console.log(`Done. Added: ${added}, Updated/Skipped: ${skipped}`);
    process.exit(0);
}

run();
