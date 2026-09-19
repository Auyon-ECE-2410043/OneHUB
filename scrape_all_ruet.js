require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const LiveFeed = require("./models/LiveFeed");

async function scrapePages(pagesToScrape) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    for (let p = 1; p <= pagesToScrape; p++) {
      console.log(`Scraping page ${p}...`);
      const res = await axios.get(`https://www.ruet.ac.bd/notice?page=${p}`, { timeout: 15000 });
      const $ = cheerio.load(res.data);
      const notices = [];

      $(".notice_list").each((i, el) => {
        const aTag = $(el).find(".headline a");
        const title = aTag.text().trim();
        const href = aTag.attr("href");
        
        const day = $(el).find(".day").text().trim();
        const month = $(el).find(".month").text().trim();
        const year = $(el).find(".year").text().trim();
        const dateStr = `${day} ${month} ${year}`;
        
        if (title && href) notices.push({ title, href, dateStr });
      });

      console.log(`Found ${notices.length} notices on page ${p}. Saving to DB...`);
      for (const notice of notices) {
        const exists = await LiveFeed.findOne({ sourceUrl: notice.href });
        if (!exists) {
          await LiveFeed.create({
            type: "ruet_news",
            title: `[RUET Notice] ${notice.title}`,
            content: `Posted on ${notice.dateStr}. Click to view details.`,
            sourceUrl: notice.href,
            active: true
          });
        }
      }
    }
    
    console.log("Done scraping!");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

scrapePages(3); // Scrape the first 3 pages (60 most recent notices)
