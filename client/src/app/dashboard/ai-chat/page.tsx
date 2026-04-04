'use client';
import { useState, useRef, useEffect } from 'react';
import api from '@/services/api';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Info,
  Wrench,
  ShieldAlert
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your HeavyMach technical assistant. How can I help you today? You can ask me about maintenance procedures, part compatibility, or troubleshooting steps.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I am sorry, but I am having trouble connecting to my brain right now. Please check your API key or try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Technical AI Assistant
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-1">Get instant help with machinery diagnostics and maintenance.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border ${
                  msg.role === 'user' ? 'bg-blue-600 border-blue-500' : 'bg-slate-800 border-slate-700'
                }`}>
                  {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={20} className="text-blue-400" />}
                </div>
                <div className={`p-4 rounded-3xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/10 border border-blue-600/20 text-blue-50 rounded-tr-none' 
                    : 'bg-slate-800/50 border border-slate-700 text-slate-200 rounded-tl-none'
                } shadow-sm`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Bot size={20} className="text-blue-400" />
                </div>
                <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700 text-slate-200 rounded-tl-none">
                  <Loader2 size={20} className="animate-spin text-blue-400" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 lg:p-6 bg-slate-950/50 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a technical question... (e.g., 'How to replace the hydraulic filter on Hitachi EX300?')"
              className="w-full pl-6 pr-14 py-4 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-slate-200 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-3 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'Maintenance Schedule', icon: Wrench },
              { label: 'Part Compatibility', icon: Info },
              { label: 'Emergency Steps', icon: ShieldAlert }
            ].map((tag, i) => (
              <button 
                key={i} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-400 transition-colors"
                onClick={() => setInput(`Tell me about ${tag.label.toLowerCase()}`)}
              >
                <tag.icon size={12} />
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
