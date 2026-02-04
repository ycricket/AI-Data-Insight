
import React, { useState, useRef, useEffect } from 'react';
import { DataAsset } from '../types';
import { analyzeWithChat } from '../services/geminiService';

interface WorkspaceAIProps {
  currentAsset: DataAsset;
  onExecuteSql: (sql: string) => void;
  lastSql?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
}

const WorkspaceAI: React.FC<WorkspaceAIProps> = ({ currentAsset, onExecuteSql, lastSql }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `您好！我是您的分析助理。当前正在分析 **${currentAsset.name}**。您可以尝试问我：“显示前10条数据”，或者更复杂的：“帮我找出所有经营状态为‘存续’的企业”。` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userText = text;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setLoading(true);

    try {
      const response = await analyzeWithChat(userText, currentAsset);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer, sql: response.sql }]);
      
      if (response.sql) {
        onExecuteSql(response.sql);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，分析过程中出现了点问题，请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "显示前10条数据",
    "帮我做个简单的统计",
    "有哪些关键字段？",
    "筛选出最近更新的记录"
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
              m.role === 'user' 
                ? 'bg-[#0052D9] text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
            }`}>
              <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>
              {m.sql && (
                <div className="mt-3 pt-3 border-t border-gray-300 border-dashed">
                  <div className="flex items-center text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-wider">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    自动执行的 SQL
                  </div>
                  <code className="text-[11px] block bg-gray-800 text-green-400 p-2 rounded overflow-x-auto whitespace-pre custom-scrollbar">
                    {m.sql}
                  </code>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4 rounded-tl-none border border-gray-200">
               <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
         {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
               {suggestions.map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleSend(s)}
                    className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full hover:border-[#0052D9] hover:text-[#0052D9] transition-all"
                  >
                    {s}
                  </button>
               ))}
            </div>
         )}
         <div className="relative group">
            <input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="告诉分析助理您想看什么数据..."
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052D9] shadow-inner transition-all group-focus-within:shadow-md"
            />
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-2 bg-[#0052D9] text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
         </div>
      </div>
    </div>
  );
};

export default WorkspaceAI;
