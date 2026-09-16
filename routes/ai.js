const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');

// Helper function to search YouTube
async function searchYouTube(query) {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY) throw new Error('YOUTUBE_API_KEY is missing');
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 5,
        key: API_KEY,
        videoEmbeddable: 'true'
      }
    });

    return response.data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    return [];
  }
}

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are OneHUB Study AI, a helpful educational assistant for university students. 
You can answer study questions normally. 
HOWEVER, if the user asks for a video, playlist, or tutorial about a specific topic (e.g., "Find me a video on thermodynamics", "show me tutorials on react"), 
you MUST respond with EXACTLY this JSON structure and nothing else:
{"action": "youtube_search", "query": "<the specific search query>"}

If the user is NOT asking for videos, just respond normally with helpful text formatted in Markdown. Keep your responses concise but highly educational.`;

    // format history for gemini
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Start chat
    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemPrompt }]
      }
    });

    const result = await chat.sendMessage(message);
    const textResponse = result.response.text();

    // Check if it's a JSON action
    try {
      const parsed = JSON.parse(textResponse.trim());
      if (parsed.action === 'youtube_search' && parsed.query) {
        // Fetch youtube results
        const videos = await searchYouTube(parsed.query);
        if (videos.length === 0) {
          return res.json({ 
            response: `I tried to search YouTube for "${parsed.query}", but I couldn't find any good results or the API key is missing.`,
            videos: []
          });
        }
        return res.json({
          response: `Here are the best educational videos I found on YouTube for "${parsed.query}":`,
          videos: videos
        });
      }
    } catch (e) {
      // Not JSON, just a normal text response
    }

    res.json({ response: textResponse, videos: [] });

  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'Failed to communicate with AI.' });
  }
});

// POST /api/ai/summarize
router.post('/summarize', auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    // Fetch transcript
    let transcriptText = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (err) {
      console.error('Transcript fetch error:', err);
      return res.status(400).json({ error: 'Could not fetch subtitles for this video. It may not have captions enabled.' });
    }

    // Truncate to avoid massive tokens if it's a 10 hour video
    const maxChars = 30000;
    if (transcriptText.length > maxChars) {
      transcriptText = transcriptText.substring(0, maxChars) + '... (truncated)';
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a university professor creating a study guide. 
Please read the following transcript from an educational video and create a highly structured, easy-to-read summary. 
Use Markdown. Include:
1. A brief overview of the video's main topic.
2. Key takeaways (bullet points).
3. Important terms or formulas mentioned (if any).

Transcript:
${transcriptText}`;

    const result = await model.generateContent(prompt);
    
    res.json({ summary: result.response.text() });

  } catch (err) {
    console.error('AI Summarize Error:', err);
    res.status(500).json({ error: 'Failed to summarize video.' });
  }
});

module.exports = router;
