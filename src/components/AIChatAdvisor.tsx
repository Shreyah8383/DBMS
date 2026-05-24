import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, HelpCircle, Heart, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { ChatMessage } from '../types';

export default function AIChatAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: "Hello! I am Dr. LifeLine, your AI Health & Wellness Advisor. I can answer general medical questions, explain health terms, provide wellness tips, or estimate ideal nutritional plates!\n\nWhat health topics can I assist you with today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "I encountered an issue gathering advice. Please retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error fetching AI health advisor answer:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "Apologies, my server gateway is temporarily busy. Please try your request again soon. In case of serious physical symptoms, do not hesitate to contact our medical desk directly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "Hello! I am Dr. LifeLine. Feel free to ask me general queries like 'Tips for lower back strain', 'Ideal dynamic blood pressure ranges', or high-fiber nutrition tips.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const PRESETS = [
    "Ideal blood pressure targets?",
    "Tips for managing chronic stress",
    "Fever treatment at home",
    "Cardio exercise schedule"
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800/80 flex flex-col h-[520px] id-ai-advisor" id="ai-advisor-container">
      {/* Advisor Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-t-3xl text-white flex items-center justify-between" id="ai-advisor-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl" id="ai-bot-avatar">
            <Bot className="h-5 w-5 text-blue-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm tracking-wide">Dr. LifeLine AI Advisor</h4>
              <span className="bg-emerald-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase leading-none flex items-center gap-0.5">
                <Sparkles className="h-2 w-2" /> Live
              </span>
            </div>
            <p className="text-[11px] text-blue-200">Empathy-driven medical assistant answers</p>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          title="Clear Conversation History"
          className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          id="ai-clear-btn"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Message Feed Canvas */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 scroll-smooth" 
        id="ai-message-feed"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            id={`ai-chat-bubble-${m.id}`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                m.sender === 'user' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400' : 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
              }`}
              id={`ai-sender-icon-${m.id}`}
            >
              {m.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className="max-w-[85%] space-y-1">
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm shadow-xs border whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white border-blue-600 rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-100 dark:border-slate-800 rounded-tl-none'
                }`}
                id={`ai-bubble-content-${m.id}`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 block px-1 text-right">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Loading indicator */}
        {loading && (
          <div className="flex items-start gap-2.5" id="ai-loading-indicator">
            <div className="p-2 bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 rounded-xl shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1" id="ai-three-dots">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Quick presets panel */}
      <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 items-center justify-center" id="ai-presets-tray">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1 flex items-center gap-0.5">
          <HelpCircle className="h-3 w-3" /> Prompts:
        </span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            id={`ai-preset-item-${idx}`}
            onClick={() => handleSendMessage(undefined, p)}
            className="text-[11px] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 hover:border-blue-200 rounded-full px-2.5 py-1 cursor-pointer transition-colors hover:shadow-xs font-semibold"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input controls form */}
      <form onSubmit={(e) => handleSendMessage(e)} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 rounded-b-3xl" id="ai-advisor-input-form">
        <input
          id="ai-text-input-field"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Dr. LifeLine general health questions..."
          className="flex-1 bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all font-medium"
          disabled={loading}
        />
        <button
          id="ai-send-submit-btn"
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl cursor-pointer transition-all disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 font-bold active:scale-95 flex items-center justify-center shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
