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
        type: 'video,playlist',
        maxResults: 5,
        key: API_KEY
      }
    });

    return response.data.items.map(item => ({
      videoId: item.id?.videoId || null,
      playlistId: item.id?.playlistId || null,
      kind: item.id?.kind,
      title: item.snippet?.title || 'Unknown Title',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
      channelTitle: item.snippet?.channelTitle || 'Unknown Channel'
    }));
  } catch (error) {
    console.error('YouTube search error:', error.response?.data || error.message);
    return [];
  }
}

const AIChat = require('../models/AIChat');

// GET /api/ai/history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const chat = await AIChat.findOne({ userId: req.user.id });
    res.json({ messages: chat ? chat.messages : [] });
  } catch (error) {
    console.error('Fetch AI History Error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});



// POST /api/ai/latex
router.post("/latex", requireAuth, async (req, res) => {
  try {
    const { topic, course } = req.body;
    if (!topic || !course) return res.status(400).json({ error: "Topic and course are required" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Gemini API key is not configured" });

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash", systemInstruction: `You are an expert LaTeX document generator specializing in Outcome-Based Education (OBE) curriculum for engineering and computer science students.

The user will provide a specific topic and course name.
Your task is to generate a COMPLETE, extremely detailed, perfectly compiling LaTeX document for a "Class Test (CT) Preparation Guide". 

You MUST perfectly replicate the exact formatting, styling, and structure of the user\'s reference PDF. 

Use EXACTLY this LaTeX template and fill it out completely:

\\documentclass[12pt,a4paper]{article}
\\usepackage{amsmath, amssymb, tikz, geometry, hyperref, booktabs, xcolor, sectsty}
\\geometry{margin=1in}
\\definecolor{myblue}{RGB}{40,80,130}
\\sectionfont{\\color{myblue}}
\\subsectionfont{\\color{myblue}}

\\begin{document}

\\begin{center}
\\LARGE \\textcolor{myblue}{[INSERT TOPIC NAME HERE]} \\\\
\\vspace{0.2cm}
\\small \\textit{Complete CT Preparation --- Theory + OBE-Style Practice Questions} \\\\
\\vspace{0.2cm}
\\normalsize RUET --- [INSERT COURSE NAME HERE]
\\end{center}
\\vspace{0.3cm}
\\hrule
\\vspace{0.5cm}

\\tableofcontents
\\newpage

\\section{What is [Topic]?}
% Explain the topic deeply, step-by-step. 
% Use \\textbf{Key Terms} and bullet points.

\\section{Core Mechanisms \& Representations}
% Provide detailed theory. Use TikZ for at least one relevant diagram/figure.
% Use \\begin{verbatim} ... \\end{verbatim} for code blocks/pseudocode.

\\section{Algorithms \& Worked Examples}
% Walk through at least one major algorithm step-by-step using given data.

\\section{Master Complexity Table}
% Use \\begin{table} with \\toprule, \\midrule, \\bottomrule to summarize key trade-offs, formulas, or time/space complexities.

\\section{One-Page Final Revision (Cheat Sheet)}
% A bulleted list of 5-10 ultra-high-yield points to memorize before the exam.

\\section{OBE-Style Practice Questions with Model Answers}
Questions below follow the same style as your CT paper: each item states a Bloom\'s-taxonomy skill level (Remember / Understand / Apply / Analyze / Evaluate). Marks are typical estimates for a 20-minute CT.

\\subsection*{Remember (Definitions)}
\\textbf{Q1. [Remember --- 3 Marks] [INSERT QUESTION]} \\\\
\\textit{Answer:} [INSERT PERFECT DETAILED ANSWER]

\\subsection*{Understand (Explain / Compare)}
\\textbf{Q2. [Understand --- 4 Marks] [INSERT QUESTION]} \\\\
\\textit{Answer:} [INSERT ANSWER]

\\subsection*{Apply (Construct / Solve with Given Data)}
\\textbf{Q3. [Apply --- 6 Marks] [INSERT QUESTION]} \\\\
\\textit{Answer:} [INSERT ANSWER]

\\subsection*{Analyze (Compare / Justify)}
\\textbf{Q4. [Analyze --- 5 Marks] [INSERT QUESTION]} \\\\
\\textit{Answer:} [INSERT ANSWER]

\\subsection*{Evaluate (Judge / Design)}
\\textbf{Q5. [Evaluate --- 5 Marks] [INSERT QUESTION]} \\\\
\\textit{Answer:} [INSERT ANSWER]

\\end{document}

CRITICAL INSTRUCTIONS:
- You must write the ENTIRE document from \\documentclass to \\end{document}.
- Do NOT output any conversational text before or after. ONLY output the raw latex wrapped in \`\`\`latex ... \`\`\`.
- Fill the template with incredibly deep, factual, and accurate content.
- Ensure all braces {} and math modes $...$ are perfectly balanced.`});

    const prompt = `Course: ${course}\nTopic: ${topic}\n\nPlease generate the complete OBE CT Preparation Guide LaTeX document now.`;
    const result = await model.generateContentStream(prompt);
    
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    res.end();
  } catch (error) {
    console.error("LaTeX generation error:", error);
    res.status(500).json({ error: "Failed to generate LaTeX document" });
  }
});

// POST /api/ai/history
router.post('/history', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    await AIChat.findOneAndUpdate(
      { userId: req.user.id },
      { messages },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Save AI History Error:', error);
    res.status(500).json({ error: 'Failed to save history' });
  }
});

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

IMAGE GENERATION CAPABILITY:
If the user asks you to generate an image, create a picture, or draw something, you MUST output a Markdown image tag pointing to the Pollinations AI generator. 
Format exactly like this:
![Image description](https://image.pollinations.ai/prompt/{URL_ENCODED_DETAILED_PROMPT}?width=1024&height=1024&nologo=true&seed={RANDOM_NUMBER})

Replace {URL_ENCODED_DETAILED_PROMPT} with a highly detailed, descriptive prompt based on the user's request, URL-encoded.
Replace {RANDOM_NUMBER} with a random integer between 1 and 99999.
Example: ![A cute robotic cat](https://image.pollinations.ai/prompt/a%20cute%20robotic%20cat%20cyberpunk%20style?width=1024&height=1024&nologo=true&seed=4812)

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
        const trimmed = textSoFar.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('```')) {
          isJson = true;
        } else if (trimmed.length > 0 && !trimmed.startsWith('`') && !trimmed.startsWith('{')) {
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
        cleanJson = cleanJson.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        
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
    res.write(`data: ${JSON.stringify({ error: err.message || 'Failed to communicate with AI.' })}\n\n`);
    res.end();
  }
});

// POST /api/ai/summarize
router.post('/summarize', requireAuth, async (req, res) => {
  try {
    const { videoId, title, description } = req.body;
    if (!videoId) return res.status(400).json({ error: 'Video ID is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured.' });
    }

    // Fetch transcript
    let transcriptText = '';
    let usedFallback = false;
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (err) {
      console.error('Transcript fetch error:', err);
      // Fallback to title and description
      if (title) {
        transcriptText = `Title: ${title}\nDescription: ${description || 'No description provided.'}\n\n(Note: The full transcript was unavailable, so please generate a study guide based on the topic implied by the title and description.)`;
        usedFallback = true;
      } else {
        return res.status(400).json({ error: 'Could not fetch subtitles, and no fallback title was provided.' });
      }
    }

    // Truncate to avoid massive tokens if it's a 10 hour video
    const maxChars = 30000;
    if (transcriptText.length > maxChars) {
      transcriptText = transcriptText.substring(0, maxChars) + '... (truncated)';
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    const prompt = `You are a university professor creating a study guide. 
    Analyze the following ${usedFallback ? 'video title and description' : 'YouTube video transcript'} and create a structured study guide with the following sections (format in Markdown):
    
    ## 🎯 Key Concepts
    (Bullet points of main ideas)
    
    ## 📝 Detailed Notes
    (Elaborate on the concepts)
    
    ## ❓ Practice Questions
    (Create 3-5 practice questions to test understanding)
    
    Here is the content:
    ${transcriptText}`;

    const result = await model.generateContent(prompt);
    
    res.json({ summary: result.response.text() });

  } catch (err) {
    console.error('AI Summarize Error:', err);
    res.status(500).json({ error: err.message || 'Failed to summarize video.' });
  }
});

module.exports = router;
