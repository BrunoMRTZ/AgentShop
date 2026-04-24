import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles } from 'lucide-react';
import { useAgent } from '../context/AgentContext';

export function AIChatAssistant() {
  const { messages, sendMessage, isTyping, chatOpen, setChatOpen } = useAgent();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      sendMessage('olá');
    }
  }, [chatOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  if (!chatOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div className="mb-4 w-[380px] max-h-[600px] bg-white rounded-2xl shadow-2xl shadow-gray-900/20 border border-gray-200 flex flex-col overflow-hidden animate-chat-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Agente de Compras</h3>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-violet-200 text-xs">Online — analisando ofertas</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                {msg.role === 'agent' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-violet-500" />
                    <span className="text-[10px] text-gray-400 font-medium">AgentShop IA</span>
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-br-md'
                      : 'bg-gray-50 text-gray-700 rounded-bl-md border border-gray-100'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          sendMessage(s);
                        }}
                        className="text-[11px] bg-violet-50 text-violet-600 px-3 py-1.5 rounded-full border border-violet-100 hover:bg-violet-100 hover:border-violet-200 transition-all font-medium"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao agente..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
