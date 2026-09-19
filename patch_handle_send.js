const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'ai', 'StudyBuddy.jsx');
let code = fs.readFileSync(filePath, 'utf-8');

const replacement = \  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + '/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \\\Bearer \\\\\\
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(1)
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        
        const lines = chunkValue.split('\\\\n\\\\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              setLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                toast.error(parsed.error);
                setMessages(prev => {
                  const newMsgs = [...prev];
                  if (newMsgs[newMsgs.length - 1].role === 'user') {
                    newMsgs.push({ role: 'model', content: 'Sorry, I encountered an error.' });
                  } else {
                    newMsgs[newMsgs.length - 1].content = 'Sorry, I encountered an error.';
                  }
                  return newMsgs;
                });
                setLoading(false);
              } else if (parsed.chunk) {
                setLoading(false); // Stop loading animation on first chunk
                setMessages(prev => {
                  const newMsgs = [...prev];
                  if (newMsgs[newMsgs.length - 1].role === 'user') {
                    newMsgs.push({ role: 'model', content: parsed.chunk });
                  } else {
                    newMsgs[newMsgs.length - 1].content += parsed.chunk;
                  }
                  return newMsgs;
                });
              } else if (parsed.action === 'navigate') {
                setLoading(false);
                setMessages(prev => {
                  const newMsgs = [...prev];
                  if (newMsgs[newMsgs.length - 1].role === 'user') {
                    newMsgs.push({ role: 'model', content: parsed.response, navigate: parsed.navigate });
                  } else {
                    newMsgs[newMsgs.length - 1].content = parsed.response;
                    newMsgs[newMsgs.length - 1].navigate = parsed.navigate;
                  }
                  return newMsgs;
                });
              } else if (parsed.action === 'youtube_search') {
                setLoading(false);
                setMessages(prev => {
                  const newMsgs = [...prev];
                  if (newMsgs[newMsgs.length - 1].role === 'user') {
                    newMsgs.push({ role: 'model', content: parsed.response, videos: parsed.videos });
                  } else {
                    newMsgs[newMsgs.length - 1].content = parsed.response;
                    newMsgs[newMsgs.length - 1].videos = parsed.videos;
                  }
                  return newMsgs;
                });
              }
            } catch (e) {
              // Ignore partial parsing errors
            }
          }
        }
      }
    } catch (err) {
      toast.error('Failed to get a response from AI');
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[newMsgs.length - 1].role === 'user') {
          newMsgs.push({ role: 'model', content: 'Sorry, I encountered an error. Please make sure the API keys are configured.' });
        } else {
          newMsgs[newMsgs.length - 1].content = 'Sorry, I encountered an error. Please make sure the API keys are configured.';
        }
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };\;

code = code.replace(/  const handleSend = async \(e\) => \{[\s\S]*?finally \{\n      setLoading\(false\);\n    \}\n  \};/, replacement);
fs.writeFileSync(filePath, code);
console.log('Fixed handleSend bubbles');
