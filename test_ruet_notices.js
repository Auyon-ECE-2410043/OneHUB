const axios = require("axios");
const cheerio = require("cheerio");
async function run() {
  const res = await axios.get("https://www.ruet.ac.bd/notice");
  const $ = cheerio.load(res.data);
  // Find where the notices are listed
  $("table tr").each((i, el) => {
    console.log($(el).text().trim().replace(/\s+/g, " "));
  });
  // If not table, maybe list items
  $(".notice-list, .list-group-item, .card").each((i, el) => {
    console.log("Found card:", $(el).text().trim().replace(/\s+/g, " ").substring(0, 100));
  });
}
run();
