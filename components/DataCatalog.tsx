
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DataAsset } from '../types';
import { SAMPLE_ASSETS } from '../constants';
import { consultDataAssets } from '../services/geminiService';
import DataDetailModal from './DataDetailModal';

interface DataCatalogProps {
  onSelect: (asset: DataAsset) => void;
  onRegister: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: DataAsset[];
}

const DataCatalog: React.FC<DataCatalogProps> = ({ onSelect, onRegister }) => {
  const [assets, setAssets] = useState<DataAsset[]>(SAMPLE_ASSETS);
  const [activeTab, setActiveTab] = useState<'ai' | 'list'>('ai');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'geography' | 'poi' | 'enterprise'>('all');
  const [viewDetailAsset, setViewDetailAsset] = useState<DataAsset | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好！我是您的数据助理。您可以告诉我您想找什么样的数据，或者咨询特定领域的数据资源。' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const filteredAssets = useMemo(() => {
    if (selectedCategory === 'all') return assets;
    return assets.filter(asset => asset.category === selectedCategory);
  }, [selectedCategory, assets]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await consultDataAssets(text);
      const recommendedAssets = assets.filter(a => result.recommendedIds.includes(a.id));
      
      const assistantMsg: Message = { 
        role: 'assistant', 
        content: result.answer,
        recommendations: recommendedAssets
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我目前无法处理您的咨询，请稍后再试。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveAsset = (updatedAsset: DataAsset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    setViewDetailAsset(updatedAsset); 
  };

  const suggestions = [
    "企业类都有哪些数据？",
    "给我推荐一些基础地理数据",
    "有没有北京的 POI 数据？",
    "哪些数据是每月更新的？"
  ];

  return (
    <div className="flex-1 h-full flex flex-col bg-gray-50 overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="bg-white border-b border-gray-200 px-8 pt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据资源中心</h1>
            <p className="text-sm text-gray-500 mt-1">发现、咨询并使用全量空间数据资源</p>
          </div>
          <button 
            onClick={onRegister}
            className="flex items-center px-4 py-2 bg-[#0052D9] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            注册新数据
          </button>
        </div>

        <div className="flex space-x-8">
          {[
            { id: 'ai', label: '智能咨询', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
            { id: 'list', label: '全量资源', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 pb-3 text-sm font-medium transition-all border-b-2 ${
                activeTab === tab.id 
                  ? 'border-[#0052D9] text-[#0052D9]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* AI CONSULTATION VIEW */}
        {activeTab === 'ai' && (
          <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#0052D9] text-white rounded-2xl rounded-tr-none' : 'bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none'} p-4`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {msg.recommendations.map(asset => (
                          <div 
                            key={asset.id}
                            onClick={() => setViewDetailAsset(asset)}
                            className="flex-shrink-0 w-64 bg-gray-50 rounded-xl border border-gray-200 p-3 hover:border-[#0052D9] cursor-pointer transition-all group"
                          >
                            <div className="flex items-center justify-between mb-2">
                               <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">RECOMMENDED</div>
                               <span className="text-[10px] text-gray-400">{asset.type.toUpperCase()}</span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-800 truncate group-hover:text-[#0052D9]">{asset.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{asset.description}</p>
                            <div className="mt-3 text-[10px] text-gray-400 flex justify-between">
                               <span>数据量: {asset.rowCount.toLocaleString()}</span>
                               <span className="text-[#0052D9]">查看详情 →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none p-4">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="p-6 bg-transparent">
              {messages.length === 1 && (
                <div className="mb-4 flex flex-wrap gap-2 justify-center">
                  {suggestions.map(s => (
                    <button 
                      key={s} 
                      onClick={() => handleSend(s)}
                      className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-[#0052D9] hover:text-[#0052D9] transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative max-w-2xl mx-auto">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="询问任何关于数据资源的问题..."
                  className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 pr-16 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0052D9] transition-all"
                />
                <button 
                  onClick={() => handleSend()}
                  className="absolute right-3 top-2.5 p-2 bg-[#0052D9] text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FULL CATALOG VIEW */}
        {activeTab === 'list' && (
          <div className="h-full p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
               <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 w-fit">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'geography', label: '基础地理' },
                  { id: 'poi', label: 'POI信息' },
                  { id: 'enterprise', label: '企业数据' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      selectedCategory === tab.id 
                        ? 'bg-gray-100 text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map((asset) => (
                  <div 
                    key={asset.id} 
                    onClick={() => setViewDetailAsset(asset)}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full group cursor-pointer"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2.5 rounded-lg ${
                            asset.category === 'geography' ? 'bg-blue-50 text-blue-600' : 
                            asset.category === 'poi' ? 'bg-orange-50 text-orange-600' : 
                            'bg-green-50 text-green-600'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {asset.category === 'geography' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                            {asset.category === 'poi' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />}
                            {asset.category === 'enterprise' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
                          </svg>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-100">
                          {asset.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#0052D9] transition-colors">{asset.name}</h3>
                      <code className="text-xs text-gray-400 font-mono mb-3">{asset.id}</code>
                      
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                          {asset.description}
                      </p>
                      
                      <div className="mt-auto space-y-2 pt-4 border-t border-gray-50 border-dashed">
                        <div className="flex items-center text-sm text-gray-600">
                           <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" /></svg>
                           数据量: {asset.rowCount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DataDetailModal 
        asset={viewDetailAsset} 
        onClose={() => setViewDetailAsset(null)}
        onAnalyze={onSelect}
        onSave={handleSaveAsset}
      />
    </div>
  );
};

export default DataCatalog;
