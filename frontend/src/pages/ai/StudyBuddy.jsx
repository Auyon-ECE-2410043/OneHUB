import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Video, MessageSquare, PlayCircle, BookOpen, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import YouTube from 'react-youtube';
import api from '../../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function StudyBuddy() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "Hi there! I am OneHUB Study AI. Ask me any study question, or ask me to find a YouTube video on a topic for you!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoSummary, setVideoSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeVideo]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage.content,
        history: messages.slice(1) // send context but exclude greeting
      });

      if (response.data.videos && response.data.videos.length > 0) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'model', 
            content: response.data.response,
            videos: response.data.videos
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev, 
          { role: 'model', content: response.data.response }
        ]);
      }
    } catch (err) {
      toast.error('Failed to get a response from AI');
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please make sure the API keys are configured.' }]);
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
        videoId: activeVideo.videoId
      });
      setVideoSummary(response.data.summary);
      toast.success("Summary generated!");
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setVideoSummary(null);
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
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
      </div>

      <div className="flex gap-6 h-full flex-1 min-h-0">
        
        {/* Chat Window */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${activeVideo ? 'w-1/3' : 'w-full'}`}>
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
                  
                  <div className={`rounded-2xl px-5 py-3.5 ${
                    msg.role === 'user' 
                      ? 'bg-sky-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}>
                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>

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
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                <PlayCircle className="w-6 h-6 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                                {video.title}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 truncate">{video.channelTitle}</p>
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
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question or request a video..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-smooth"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-purple-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-center">
               <p className="text-[10px] text-slate-500">Gemini can make mistakes. Consider verifying important information.</p>
            </div>
          </div>
        </div>

        {/* Video Player & Summarizer Area */}
        {activeVideo && (
          <div className="w-2/3 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-fade-in">
            {/* Player Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="truncate pr-4">
                  <h3 className="font-semibold text-white truncate">{activeVideo.title}</h3>
                  <p className="text-xs text-slate-400 truncate">{activeVideo.channelTitle}</p>
                </div>
              </div>
              <button 
                onClick={closeVideo}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full aspect-video bg-black relative">
              <YouTube 
                videoId={activeVideo.videoId} 
                opts={opts}
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
                <div className="text-center py-12 px-4 bg-slate-800/30 rounded-xl border border-slate-700/30 border-dashed">
                  <Bot className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No study guide generated yet.</p>
                  <p className="text-sm text-slate-500 mt-1">Click the button above to let Gemini watch the video and create a structured summary for you.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
