const fs = require('fs');
const file = 'routes/ai.js';
let c = fs.readFileSync(file, 'utf8');

const imageInstruction = `

IMAGE GENERATION CAPABILITY:
If the user asks you to generate an image, create a picture, or draw something, you MUST output a Markdown image tag pointing to the Pollinations AI generator. 
Format exactly like this:
![Image description](https://image.pollinations.ai/prompt/{URL_ENCODED_DETAILED_PROMPT}?width=1024&height=1024&nologo=true&seed={RANDOM_NUMBER})

Replace {URL_ENCODED_DETAILED_PROMPT} with a highly detailed, descriptive prompt based on the user's request, URL-encoded.
Replace {RANDOM_NUMBER} with a random integer between 1 and 99999.
Example: ![A cute robotic cat](https://image.pollinations.ai/prompt/a%20cute%20robotic%20cat%20cyberpunk%20style?width=1024&height=1024&nologo=true&seed=4812)`;

c = c.replace('You can answer study questions normally.', 'You can answer study questions normally.' + imageInstruction);
fs.writeFileSync(file, c);
console.log('Added image generation capability!');
