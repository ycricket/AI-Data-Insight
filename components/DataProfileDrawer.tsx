import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DataProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columnName: string | null;
  data: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DataProfileDrawer: React.FC<DataProfileDrawerProps> = ({ isOpen, onClose, columnName, data }) => {
  const stats = useMemo(() => {
    if (!columnName || !data.length) return null;

    const values = data.map(row => row[columnName]);
    const total = values.length;
    const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
    const uniqueValues = new Set(values).size;
    
    // Determine type simple logic
    const isNumber = values.some(v => typeof v === 'number');

    let distribution: { name: string; value: number }[] = [];

    if (isNumber) {
      // Create Histogram buckets (simplified)
      const validNums = values.filter(v => typeof v === 'number') as number[];
      if (validNums.length > 0) {
        const min = Math.min(...validNums);
        const max = Math.max(...validNums);
        const range = max - min;
        const bucketCount = 5;
        const bucketSize = range / bucketCount || 1;
        
        const buckets = Array(bucketCount).fill(0);
        const bucketLabels = Array(bucketCount).fill('');
        
        for(let i=0; i<bucketCount; i++) {
            bucketLabels[i] = `${Math.floor(min + i*bucketSize)} - ${Math.floor(min + (i+1)*bucketSize)}`;
        }

        validNums.forEach(v => {
          const bucketIndex = Math.min(Math.floor((v - min) / bucketSize), bucketCount - 1);
          buckets[bucketIndex]++;
        });

        distribution = buckets.map((count, i) => ({ name: bucketLabels[i], value: count }));
      }
    } else {
      // Frequency count for categorical
      const counts: Record<string, number> = {};
      values.forEach(v => {
        const key = String(v);
        counts[key] = (counts[key] || 0) + 1;
      });
      // Top 10
      distribution = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));
    }

    return { total, nullCount, uniqueValues, isNumber, distribution };
  }, [columnName, data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-l border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">
          字段画像: <span className="text-[#0052D9]">{columnName}</span>
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {stats && (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500 uppercase">填充率</div>
                <div className="text-xl font-bold text-gray-800">
                  {((stats.total - stats.nullCount) / stats.total * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500 uppercase">唯一值</div>
                <div className="text-xl font-bold text-gray-800">{stats.uniqueValues}</div>
              </div>
            </div>

            {/* Visualization */}
            <div className="h-64">
                <h4 className="text-sm font-medium text-gray-700 mb-4">数值分布</h4>
                <ResponsiveContainer width="100%" height="100%">
                  {stats.isNumber ? (
                    <BarChart data={stats.distribution}>
                      <XAxis dataKey="name" fontSize={10} interval={0} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0052D9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={stats.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
            </div>
            
             <div className="text-xs text-gray-400 text-center">
                分类数据仅展示前10项
             </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataProfileDrawer;
