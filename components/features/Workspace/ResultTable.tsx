import React from 'react';
import { QueryResult } from '../../../types';

interface ResultTableProps {
  result: QueryResult | null;
  loading: boolean;
  selectedIndices: Set<number>;
  onSelectChange: (indices: Set<number>) => void;
  onHoverRow: (id: string | number | null) => void;
}

const ResultTable: React.FC<ResultTableProps> = ({ result, loading, selectedIndices, onSelectChange, onHoverRow }) => {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white">
        <svg className="w-16 h-16 mb-4 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8-4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
        <span className="text-sm font-medium">暂无数据结果，请在上方输入分析需求</span>
      </div>
    );
  }

  const toggleAll = (checked: boolean) => {
    if (checked) {
      // 限制全选最多前 20 条
      const maxToSelect = Math.min(20, result.rows.length);
      const newIndices = new Set<number>();
      for (let i = 0; i < maxToSelect; i++) {
        newIndices.add(i);
      }
      onSelectChange(newIndices);
    } else {
      onSelectChange(new Set());
    }
  };

  const toggleRow = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      // 限制单选上限为 20 条
      if (next.size >= 20) {
        return;
      }
      next.add(idx);
    }
    onSelectChange(next);
  };

  return (
    <div className="h-full overflow-auto custom-scrollbar bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-[11px]">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="w-10 px-3 py-3">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-[#0052D9] focus:ring-[#0052D9]"
                checked={selectedIndices.size > 0 && (selectedIndices.size === Math.min(20, result.rows.length))} 
                onChange={e => toggleAll(e.target.checked)}
                title={result.rows.length > 20 ? "由于限制，全选仅选取前20条" : "全选"}
              />
            </th>
            {result.columns.map(col => (
              <th key={col} className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {result.rows.map((row, idx) => (
            <tr 
              key={idx} 
              onMouseEnter={() => onHoverRow(row.id || row.ent_id || row.poi_id || idx)} 
              onMouseLeave={() => onHoverRow(null)}
              className="hover:bg-blue-50/60 transition-colors"
            >
              <td className="px-3 py-2 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-[#0052D9] focus:ring-[#0052D9] disabled:opacity-30"
                  checked={selectedIndices.has(idx)} 
                  onChange={() => toggleRow(idx)} 
                  disabled={!selectedIndices.has(idx) && selectedIndices.size >= 20}
                />
              </td>
              {result.columns.map(col => (
                <td key={col} className="px-4 py-2 text-gray-700 font-medium truncate max-w-[150px]">{String(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;