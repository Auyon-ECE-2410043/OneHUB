const axios = require("axios");
const cheerio = require("cheerio");
async function run() {
  const res = await axios.get("https://www.ruet.ac.bd");
  const $ = cheerio.load(res.data);
  $("img").each((i, el) => {
    const src = $(el).attr("src");
    if (src && src.toLowerCase().includes("logo") || src && src.toLowerCase().includes("ruet")) {
      console.log("Found image:", src);
    }
  });
}
run();
