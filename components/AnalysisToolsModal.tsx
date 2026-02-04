import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { analyzeDataInsights } from '../services/geminiService';

interface AnalysisToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  columns: string[];
}

type TabType = 'overview' | 'statistics' | 'anomalies' | 'ai';

const AnalysisToolsModal: React.FC<AnalysisToolsModalProps> = ({ isOpen, onClose, data, columns }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Reset AI insight when data changes to ensure new queries get new analysis
  useEffect(() => {
    setAiInsight('');
  }, [data]);

  // Identify numeric columns
  const numericColumns = useMemo(() => {
    if (!data.length) return [];
    return columns.filter(col => {
      // Check first few non-null rows to see if it's a number
      const validRow = data.find(row => row[col] !== null && row[col] !== undefined);
      return validRow && typeof validRow[col] === 'number';
    });
  }, [data, columns]);

  // Basic Statistics
  const statistics = useMemo(() => {
    if (!data.length) return {};
    const stats: Record<string, any> = {};
    
    numericColumns.forEach(col => {
      const values = data.map(r => r[col]).filter(v => typeof v === 'number');
      if (values.length === 0) return;
      
      const min = Math.min(...values);
      const max = Math.max(...values);
      const sum = values.reduce((a, b) => a + b, 0);
      const mean = sum / values.length;
      
      // Std Dev
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      stats[col] = { min, max, mean, stdDev, count: values.length };
    });
    return stats;
  }, [data, numericColumns]);

  // Outlier Detection (Simple IQR method)
  const anomalies = useMemo(() => {
    const outliers: any[] = [];
    if (!data.length) return outliers;

    numericColumns.forEach(col => {
      const values = data.map(r => r[col]).filter(v => typeof v === 'number').sort((a, b) => a - b);
      if (values.length < 4) return;

      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      data.forEach((row, idx) => {
        const val = row[col];
        if (typeof val === 'number' && (val < lowerBound || val > upperBound)) {
           // Avoid duplicates if a row is outlier in multiple columns
           if (!outliers.find(o => o.rowIndex === idx)) {
             outliers.push({
               rowIndex: idx,
               reason: `${col} 值 (${val}) 异常`,
               data: row
             });
           }
        }
      });
    });
    return outliers.slice(0, 50); // Limit to 50
  }, [data, numericColumns]);

  // Generate AI Insights when tab is switched
  useEffect(() => {
    if (activeTab === 'ai' && !aiInsight && data.length > 0) {
      setIsLoadingAi(true);
      analyzeDataInsights(data).then(text => {
        setAiInsight(text);
        setIsLoadingAi(false);
      });
    }
  }, [activeTab, data, aiInsight]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-800">数据分析探查工具箱</h3>
                <p className="text-xs text-gray-500">基于当前查询结果 ({data.length} 行)</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: '数据概览' },
            { id: 'statistics', label: '描述统计' },
            { id: 'anomalies', label: '异常检测' },
            { id: 'ai', label: 'AI 智能洞察' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                     <div className="text-sm text-gray-500 mb-1">总行数</div>
                     <div className="text-2xl font-bold text-gray-800">{data.length}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                     <div className="text-sm text-gray-500 mb-1">字段数</div>
                     <div className="text-2xl font-bold text-gray-800">{columns.length}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                     <div className="text-sm text-gray-500 mb-1">数值型字段</div>
                     <div className="text-2xl font-bold text-indigo-600">{numericColumns.length}</div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-700 mb-4">缺失值分析</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={columns.map(col => ({
                        name: col,
                        missing: data.filter(r => r[col] === null || r[col] === undefined || r[col] === '').length
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-30} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="missing" fill="#FF8042" name="缺失行数" barSize={40} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          )}

          {/* STATISTICS TAB */}
          {activeTab === 'statistics' && (
             <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">字段名</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">最小值 (Min)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">最大值 (Max)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">平均值 (Mean)</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">标准差 (StdDev)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(statistics).map(([col, stat]: [string, any]) => (
                        <tr key={col} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{col}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{stat.min?.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{stat.max?.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{stat.mean?.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{stat.stdDev?.toFixed(2)}</td>
                        </tr>
                      ))}
                      {numericColumns.length === 0 && (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">无数值型字段可分析</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {/* ANOMALIES TAB */}
          {activeTab === 'anomalies' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      使用 IQR (四分位距) 算法检测到的潜在异常值。仅展示前 50 条。
                    </p>
                  </div>
                </div>
              </div>
              
              {anomalies.length > 0 ? (
                <div className="grid gap-4">
                   {anomalies.map((item, idx) => (
                     <div key={idx} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                            行 #{item.rowIndex + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{item.reason}</span>
                          <div className="mt-1 text-xs text-gray-500 font-mono">
                            {/* Show a preview of the row data */}
                            {JSON.stringify(item.data).slice(0, 80)}...
                          </div>
                        </div>
                        <button className="text-sm text-indigo-600 hover:text-indigo-900">查看详情</button>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                   <svg className="w-12 h-12 mb-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <p>未检测到明显的数值异常。</p>
                </div>
              )}
            </div>
          )}

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <div className="h-full flex flex-col">
               {isLoadingAi ? (
                 <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600 animate-pulse">AI 正在深度分析数据模式...</p>
                 </div>
               ) : (
                 <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm leading-relaxed text-gray-700 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-2xl">✨</span>
                       <h4 className="font-bold text-gray-900">智能分析报告</h4>
                    </div>
                    {aiInsight ? (
                      <div className="prose prose-sm max-w-none whitespace-pre-line">
                        {aiInsight}
                      </div>
                    ) : (
                       <p className="text-gray-500 italic">无法生成分析报告，请检查网络或 API 设置。</p>
                    )}
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AnalysisToolsModal;
