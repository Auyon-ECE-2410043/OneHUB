const axios = require("axios");
const cheerio = require("cheerio");
async function run() {
  const res = await axios.get("https://www.ruet.ac.bd");
  const $ = cheerio.load(res.data);
  $("a").each((i, el) => {
    const href = $(el).attr("href");
    if (href && href.toLowerCase().includes("notice")) {
      console.log($(el).text().trim().replace(/\n/g," "), "=>", href);
    }
  });
}
run();
