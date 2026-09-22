const fs = require("fs");
let c = fs.readFileSync("routes/ai.js", "utf8");

const replacement = `    const result = await model.generateContentStream(prompt);
    
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    res.end();
  } catch (error) {`;

c = c.replace(`    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ latex: text });
  } catch (error) {`, replacement);

fs.writeFileSync("routes/ai.js", c);
console.log("Stream patch applied.");

