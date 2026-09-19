const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'ai', 'StudyBuddy.jsx');
let code = fs.readFileSync(filePath, 'utf-8');

const sseFrontend = \
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage, { role: 'model', content: '' }]);
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
                  newMsgs[newMsgs.length - 1].content = 'Sorry, I encountered an error.';
                  return newMsgs;
                });
              } else if (parsed.chunk) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content += parsed.chunk;
                  return newMsgs;
                });
              } else if (parsed.action === 'navigate') {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = parsed.response;
                  newMsgs[newMsgs.length - 1].navigate = parsed.navigate;
                  return newMsgs;
                });
              } else if (parsed.action === 'youtube_search') {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = parsed.response;
                  newMsgs[newMsgs.length - 1].videos = parsed.videos;
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          }
        }
      }
    } catch (err) {
      toast.error('Failed to get a response from AI');
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = 'Sorry, I encountered an error. Please make sure the API keys are configured.';
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };
\;

code = code.replace(/const handleSend = async \(e\) => \{[\s\S]*?finally \{\n      setLoading\(false\);\n    \}\n  \};/, sseFrontend.trim());

fs.writeFileSync(filePath, code);
console.log('Frontend patched');
