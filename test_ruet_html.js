const axios = require("axios");
const cheerio = require("cheerio");
async function run() {
  const res = await axios.get("https://www.ruet.ac.bd/notice");
  const $ = cheerio.load(res.data);
  console.log($(".card").eq(1).html());
}
run();
