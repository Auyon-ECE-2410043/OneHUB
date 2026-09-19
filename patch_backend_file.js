const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'routes', 'ai.js');
let code = fs.readFileSync(filePath, 'utf-8');

// Replace the req.body extraction
code = code.replace(
  /const \{ message, history \} = req\.body;/,
  \const { message, history, file } = req.body;\
);

// Replace the sendMessageStream call
code = code.replace(
  /const result = await chat\.sendMessageStream\(message\);/,
  \let userMessageParts = [{ text: message }];
    if (file && file.data && file.type) {
      const base64Data = file.data.split(',')[1];
      if (base64Data) {
        userMessageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        });
      }
    }
    const result = await chat.sendMessageStream(userMessageParts);\
);

fs.writeFileSync(filePath, code);
console.log('Backend file handling patched');
