const axios = require('axios');
async function test() {
  try {
    // We mock requireAuth in middleware to allow this test
    const res = await axios.post('http://localhost:5000/api/ai/chat', {
      message: 'hi',
      history: []
    }, {
      headers: { Authorization: 'Bearer test' }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
