const axios = require("axios");
const cheerio = require("cheerio");
const LiveFeed = require("../models/LiveFeed");

async function scrapeRuetNotices() {
  try {
    const res = await axios.get("https://www.ruet.ac.bd/notice", { timeout: 10000 });
    const $ = cheerio.load(res.data);
    const notices = [];

    $(".notice_list").each((i, el) => {
      if (i > 4) return; // Top 5 notices only
      const aTag = $(el).find(".headline a");
      const title = aTag.text().trim();
      const href = aTag.attr("href");
      
      const day = $(el).find(".day").text().trim();
      const month = $(el).find(".month").text().trim();
      const year = $(el).find(".year").text().trim();
      const dateStr = `${day} ${month} ${year}`;
      
      if (title && href) {
        notices.push({ title, href, dateStr });
      }
    });

    for (const notice of notices) {
      const exists = await LiveFeed.findOne({ sourceUrl: notice.href });
      if (!exists) {
        await LiveFeed.create({
          type: "ruet_news",
          createdAt: new Date(notice.dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1")),
          title: `[RUET Notice] ${notice.title}`,
          content: `Posted on ${notice.dateStr}. Click to view details.`,
          sourceUrl: notice.href,
          active: true
        });
        console.log(`Scraped new notice: ${notice.title}`);
      }
    }
  } catch (e) {
    console.error("Failed to scrape RUET notices:", e.message);
  }
}

module.exports = { scrapeRuetNotices };
const cron = require('node-cron');
function initRuetScraper() {
  console.log('RUET Notice Scraper initialized (running every 6 hours)');
  cron.schedule('0 */6 * * *', () => {
    scrapeRuetNotices();
  });
}
module.exports.initRuetScraper = initRuetScraper;
