require('dotenv').config();
const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'hi',
      history: []
    }, {
      headers: {
        Authorization: 'Bearer fake-token-wont-work-because-auth'
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
