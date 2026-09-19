const axios = require('axios');
require('dotenv').config();

async function test() {
  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: "neso academy digital electronics",
          type: 'video,playlist',
          maxResults: 5,
          key: process.env.YOUTUBE_API_KEY
        }
      });
    console.log("Success, got", res.data.items.length, "items");
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}
test();
