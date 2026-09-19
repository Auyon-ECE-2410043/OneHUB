const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');
require('dotenv').config();

async function test() {
  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: "Gauss's Law physics tutorial step by step problems",
          type: 'video',
          maxResults: 1,
          key: process.env.YOUTUBE_API_KEY
        }
      });
    const videoId = res.data.items[0].id.videoId;
    console.log("Found video:", videoId);
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log("Success, got transcript");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
