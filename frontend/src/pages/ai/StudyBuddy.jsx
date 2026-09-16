import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Video, MessageSquare, PlayCircle, BookOpen, X, FileText, ExternalLink, Trash2, Paperclip, ListVideo } from 'lucide-react';
import { toast } from 'sonner';
import YouTube from 'react-youtube';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useNavigate } from 'react-router-dom';

export default function StudyBuddy() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('studyBuddyChatHistory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        role: 'model',
        content: "Hi there! I am OneHUB Study AI. Ask me any study question, or ask me to find a YouTube video on a topic for you!"
      }
    ];
  });
  
  // Load history from API in the background and merge with localStorage cache
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/ai/history');
        if (data.messages && data.messages.length > 0) {
          // Compare with local to see if we need to update
          const localStr = localStorage.getItem('studyBuddyChatHistory');
          const local = localStr ? JSON.parse(localStr) : [];
          if (local.length < data.messages.length || (data.messages.length > 0 && local.length === 0)) {
            setMessages(data.messages);
            localStorage.setItem('studyBuddyChatHistory', JSON.stringify(data.messages));
          }
        }
      } catch (err) {
        console.error('Failed to sync history from cloud:', err);
      }
    };
    fetchHistory();
  }, []);

  // Sync to cloud whenever messages change (debounce slightly to avoid spam on stream chunks)
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('studyBuddyChatHistory', JSON.stringify(messages));
      
      // Only sync to cloud if it's not currently streaming (loading is false)
      // or if we cleared the chat (messages length is 1)
      if (!loading) {
        const timeout = setTimeout(() => {
          api.post('/ai/history', { messages }).catch(console.error);
        }, 1000);
        const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };

  return () => clearTimeout(timeout);
      }
    } else {
      localStorage.removeItem('studyBuddyChatHistory');
      if (!loading) {
        api.post('/ai/history', { messages: [] }).catch(console.error);
      }
    }
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: "Hi there! I am OneHUB Study AI. Ask me any study question, or ask me to find a YouTube video on a topic for you!"
      }
    ]);
    setActiveVideo(null);
    setVideoSummary(null);
  };

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);


  
  const [videoSummary, setVideoSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        name: file.name,
        type: file.type,
        data: reader.result
      });
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeVideo]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    let displayContent = input;
    if (selectedFile) {
      if (input.trim()) displayContent += `\n\n*(Attached: ${selectedFile.name})*`;
      else displayContent = `*(Attached: ${selectedFile.name})*`;
    }

    const userMessage = { role: 'user', content: displayContent };
    setMessages(prev => [...prev, userMessage]);
    
    const messageToSend = input;
    const fileToSend = selectedFile;
    
    setInput('');
    setSelectedFile(null);
    setLoading(true);

    try {
      const response = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000/api") + '/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: messageToSend,
          file: fileToSend,
          history: messages.slice(1).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        
        const lines = chunkValue.split('\n\n');
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
                    newMsgs.push({ role: 'model', content: `Sorry, I encountered an error: ${parsed.error}` });
                  } else {
                    newMsgs[newMsgs.length - 1].content = `Sorry, I encountered an error: ${parsed.error}`;
                  }
                  return newMsgs;
                });
                setLoading(false);
                return;
              } else if (parsed.chunk) {
                setLoading(false);
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
  };

  const handleSummarize = async () => {
    if (!activeVideo) return;
    
    setSummarizing(true);
    setVideoSummary(null);
    try {
      const response = await api.post('/ai/summarize', {
        videoId: activeVideo.videoId,
        title: activeVideo.title,
        description: activeVideo.description
      });
      setVideoSummary(response.data.summary);
      toast.success("Summary generated!");
    } catch (err) {
      toast.error(err.message || 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setVideoSummary(null);
  };

  

  

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-8 h-8 text-purple-400" />
            OneHUB Study AI
          </h2>
          <p className="text-sm text-slate-400 mt-1">Your personal AI tutor and video assistant.</p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </button>
      </div>

      <div className="flex gap-6 h-full flex-1 min-h-0">
        
        {/* Chat Window */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${activeVideo ? 'lg:w-[400px] xl:w-[450px] shrink-0 w-full hidden lg:flex' : 'w-full'}`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">StudyBuddy AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-slate-400">Online & Ready</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => (
      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
          
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            msg.role === 'user' 
              ? 'bg-sky-500/20 text-sky-400' 
              : 'bg-purple-500/20 text-purple-400'
          }`}>
            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>

          <div className={`p-4 rounded-2xl ${
            msg.role === 'user'
              ? 'bg-sky-500 text-white rounded-br-none'
              : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
          }`}>
            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>

            {msg.navigate && (
              <div className="mt-4">
                <button
                  onClick={() => navigate(msg.navigate)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-indigo-500/25"
                >
                  <ExternalLink className="w-4 h-4" />
                  Go to Section
                </button>
              </div>
            )}

            {msg.videos && msg.videos.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Video className="w-4 h-4" /> YouTube Results
                </div>
                {msg.videos.map((video, vidx) => (
                  <div 
                    key={vidx}
                    onClick={() => setActiveVideo(video)}
                    className="flex gap-3 bg-slate-900/80 hover:bg-slate-900 p-2 rounded-xl cursor-pointer border border-slate-700/50 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0">
                      <img src={video.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                      {video.kind === 'youtube#playlist' && (
                        <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-white flex items-center gap-1 shadow-md">
                          <ListVideo className="w-2.5 h-2.5" />
                          PLAYLIST
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                        {video.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        {video.channelTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-800">
            {selectedFile && (
              <div className="mb-3 flex items-center gap-3 bg-slate-800 w-max px-4 py-2 rounded-lg border border-slate-700">
                 <FileText className="w-4 h-4 text-purple-400" />
                 <span className="text-sm text-slate-300 max-w-[200px] truncate">{selectedFile.name}</span>
                 <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-500 hover:text-red-400">
                   <X className="w-4 h-4" />
                 </button>
              </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileSelect} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute left-2 p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors z-10"
                title="Upload image or PDF (max 5MB)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question, upload an image, or request a video..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-smooth"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={(!input.trim() && !selectedFile) || loading}
                className="absolute right-2 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-purple-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-center">
               <p className="text-[10px] text-slate-500">Studybuddy can make mistakes. Consider verifying important information.</p>
            </div>
          </div>
        </div>

        {/* Video Player & Summarizer Area */}
        {activeVideo && (
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in min-w-0">
            {/* Player Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="truncate pr-4">
                  <h3 className="font-semibold text-white truncate">{activeVideo.title}</h3>
                  <p className="text-sm text-slate-400 truncate mt-0.5">{activeVideo.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full bg-black relative shrink-0 h-[45%] border-b border-slate-800">
              <YouTube 
                videoId={activeVideo.kind === 'youtube#playlist' ? undefined : activeVideo.videoId} 
                opts={{
                  ...opts,
                  playerVars: {
                    ...opts.playerVars,
                    ...(activeVideo.kind === 'youtube#playlist' ? { listType: 'playlist', list: activeVideo.playlistId } : {})
                  }
                }}
                className="absolute inset-0 w-full h-full"
                iframeClassName="w-full h-full border-0"
              />
            </div>

            {/* Video Details & Summary */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  AI Study Guide
                </h4>
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {summarizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Guide...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>

              {videoSummary ? (
                <div className="prose prose-invert prose-indigo max-w-none text-sm bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {videoSummary}
                  </ReactMarkdown>
                </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No study guide generated yet.</p>
                    <p className="text-sm text-slate-500 mt-1">Click the button above to let StudyBuddy watch the video and create a structured summary for you.</p>
                  </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
