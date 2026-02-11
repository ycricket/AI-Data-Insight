import React, { useState } from 'react';
import { generateSqlFromText } from '../../../services';

interface SqlEditorProps {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
  isRunning: boolean;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ value, onChange, onRun, isRunning }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setAiError(null);
    try {
      const sql = await generateSqlFromText(aiPrompt);
      onChange(sql);
    } catch (err: any) {
      setAiError(err.message || "AI 生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      onRun();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-b border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 w-full max-w-3xl">
          <div className="flex-1 relative">
            <input 
              type="text" 
              className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0052D9] focus:border-transparent outline-none"
              placeholder="让 AI 编写 SQL (例如: '显示北京的高价值企业')"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <button 
            onClick={handleAiGenerate}
            disabled={isGenerating || !aiPrompt}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md hover:bg-indigo-100 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isGenerating ? '思考中...' : 'AI 生成'}
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
           <span className="text-xs text-gray-400">Ctrl + Enter 运行</span>
           <button 
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center px-4 py-1.5 bg-[#0052D9] text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {isRunning ? '执行中...' : '运行查询'}
          </button>
        </div>
      </div>

      {aiError && (
        <div className="bg-red-50 text-red-600 text-xs px-4 py-1 border-b border-red-100">
          {aiError}
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 relative font-mono text-sm">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-4 resize-none outline-none text-gray-800 bg-gray-50 focus:bg-white transition-colors custom-scrollbar"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default SqlEditor;