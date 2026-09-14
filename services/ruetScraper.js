const axios = require("axios");
const cheerio = require("cheerio");
const LiveFeed = require("../models/LiveFeed");

async function scrapeRuet() {
  try {
    console.log("[RUET Scraper] Fetching latest news from www.ruet.ac.bd...");
    const res = await axios.get("https://www.ruet.ac.bd/", {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(res.data);
    const newItems = [];

    function extractDate(el) {
        const parentText = $(el).closest("li, .news-item, .event-item, div.row, div.col, .news_events").text().replace(/\n/g, " ");
        // Look for common formats like 14 Sep 2026, 14th May 2026, 14/09/2026, 2026-09-14
        const dateMatch = parentText.match(/(\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]{3,9}\s+\d{4})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i);
        
        if (dateMatch) {
            let dateStr = dateMatch[0].replace(/(st|nd|rd|th)/gi, "");
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.valueOf())) return parsed;
        }
        return new Date(); // Fallback to now
    }

    // General heuristic for RUET website news/events/achievements
    $(".news, .events, .notice-board, .achievements, #news, #events, .single-news, .news-content, .recent-news").find("a").each((i, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href");
      
      if (title && title.length > 15 && title.length < 150) {
        newItems.push({
          title: title.replace(/\s+/g, " "),
          content: href ? (href.startsWith("http") ? href : "https://www.ruet.ac.bd" + (href.startsWith("/") ? href : "/" + href)) : "Official Website Update",
          type: title.toLowerCase().includes("achievement") ? "achievement" : "ruet_news",
          createdAt: extractDate(el)
        });
      }
    });

    // Also fallback: grab heading tags if they contain links
    $("h3, h4, h5, h6").each((i, el) => {
       const text = $(el).text().trim();
       if (text.length > 15 && text.length < 150) {
          const href = $(el).closest("a").attr("href") || $(el).find("a").attr("href");
          if (href) {
             newItems.push({
               title: text.replace(/\s+/g, " "),
               content: href.startsWith("http") ? href : "https://www.ruet.ac.bd" + (href.startsWith("/") ? href : "/" + href),
               type: text.toLowerCase().includes("achievement") ? "achievement" : "ruet_news",
               createdAt: extractDate(el)
             });
          }
       }
    });

    if (newItems.length === 0) {
       console.log("[RUET Scraper] No obvious news items found on the homepage.");
       return;
    }

    // Deduplicate
    const uniqueItems = [];
    const titles = new Set();
    for (const item of newItems) {
      if (!titles.has(item.title)) {
        titles.add(item.title);
        uniqueItems.push(item);
      }
    }

    // Top 5 most recent
    const topItems = uniqueItems.slice(0, 5);
    let addedCount = 0;

    for (const item of topItems) {
      const existing = await LiveFeed.findOne({ title: item.title });
      if (!existing) {
        await LiveFeed.create({
          title: item.title,
          content: "Official update: " + item.content,
          type: item.type,
          active: true,
          createdAt: item.createdAt
        });
        addedCount++;
      }
    }
    
    console.log(`[RUET Scraper] Successfully synced ${addedCount} new items from RUET.`);
  } catch (err) {
    console.error("[RUET Scraper] Error scraping:", err.message);
  }
}

const cron = require("node-cron");
function initRuetScraper() {
  console.log("RUET News Scraper initialized (running every 30 minutes)");
  // Run every 30 minutes
  cron.schedule("*/30 * * * *", () => {
    scrapeRuet();
  });
  // Also run immediately on boot
  scrapeRuet();
}

module.exports = { scrapeRuet, initRuetScraper };

