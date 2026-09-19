const axios = require('axios');
async function testSSE() {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://onehub-api.onrender.com/api/ai/chat',
      data: { message: "what is a tree", history: [] },
      responseType: 'stream',
      headers: { 'Authorization': 'Bearer test' } // It might fail auth, but let's see
    });
    
    response.data.on('data', chunk => {
      console.log('CHUNK:', chunk.toString());
    });
    response.data.on('end', () => {
      console.log('DONE');
    });
  } catch (e) {
    console.error("ERROR:", e.message);
    if (e.response) {
      console.error(e.response.status);
    }
  }
}
testSSE();
