const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
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
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, history, file } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const systemPrompt = `You are OneHUB Study AI, a helpful educational assistant for university students using the RUET OneHUB portal.

Here is the complete sitemap of the OneHUB portal to help students navigate:
- Dashboard (Overview): /dashboard
- My Courses (Syllabus, Materials, Course list): /courses
- Specific Course details: /courses/[course_code] (e.g. /courses/ECE2103)
- Weekly Routine / Class Schedule: /routine
- Course Registration: /registration
- Fees & Payment: /fees
- Marks & Grades: /marks
- CGPA Analytics: /cgpa
- Attendance Record: /attendance
- Notice Board: /notices
- Hall Management: /hall (or /hall/apply)
- Faculty Directory: /faculty
- Dining Tokens: /dining
- Medical Center: /medical
- Clearance Status: /clearance
- Academic Calendar: /calendar
- User Profile: /profile

You can answer study questions normally.

SPECIAL ACTIONS (JSON ONLY):
1. If the user asks for a video tutorial, or a video would be beneficial, return this JSON ONLY:
{
  "action": "youtube_search",
  "query": "the best search query for youtube",
  "message": "Here are some videos that explain..."
}

2. If the user asks where to find something on the portal or asks you to navigate them (e.g., "where is my syllabus for ECE 2103", "take me to my routine"), return this JSON ONLY:
{
  "action": "navigate",
  "route": "/the_matching_route_from_sitemap",
  "message": "Sure, I can help you find that. Click the button below to go there!"
}

If NO special action is needed (no video, no navigation), just answer normally as plain text using Markdown. Keep your responses concise but highly educational.`;

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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let userMessageParts = [{ text: message || "Here is a file." }];
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

    const result = await chat.sendMessageStream(userMessageParts);
    
    let textSoFar = '';
    let isJson = null;

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      textSoFar += chunkText;
      
      if (isJson === null) {
        if (textSoFar.trim().startsWith('{')) {
          isJson = true;
        } else if (textSoFar.trim().length > 0) {
          isJson = false;
          res.write(`data: ${JSON.stringify({ chunk: textSoFar })}\n\n`);
        }
      } else if (!isJson) {
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    if (isJson) {
      try {
        let cleanJson = textSoFar.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
        
        const parsed = JSON.parse(cleanJson.trim());
        
        if (parsed && parsed.action === 'navigate') {
          res.write(`data: ${JSON.stringify({ action: 'navigate', response: parsed.message || "Here is the link you requested.", navigate: parsed.route })}\n\n`);
        } else if (parsed && parsed.action === 'youtube_search') {
          const videos = await searchYouTube(parsed.query);
          res.write(`data: ${JSON.stringify({ action: 'youtube_search', response: parsed.message || "Here are some video tutorials I found for you:", videos })}\n\n`);
        } else {
          res.write(`data: ${JSON.stringify({ chunk: textSoFar })}\n\n`);
        }
      } catch (e) {
        res.write(`data: ${JSON.stringify({ chunk: textSoFar })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to communicate with AI.' })}\n\n`);
    res.end();
  }
});

// POST /api/ai/summarize
router.post('/summarize', requireAuth, async (req, res) => {
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
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

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
