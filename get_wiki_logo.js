const axios = require("axios");
const cheerio = require("cheerio");
async function run() {
  const res = await axios.get("https://en.wikipedia.org/wiki/Rajshahi_University_of_Engineering_%26_Technology");
  const $ = cheerio.load(res.data);
  $("img").each((i, el) => {
    const src = $(el).attr("src");
    if (src && src.toLowerCase().includes("logo")) {
      console.log("Found wiki logo:", src);
    }
  });
}
run();
