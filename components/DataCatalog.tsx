import React, { useState, useMemo } from 'react';
import { DataAsset } from '../types';
import { SAMPLE_ASSETS } from '../constants';
import DataDetailModal from './DataDetailModal';

interface DataCatalogProps {
  onSelect: (asset: DataAsset) => void;
  onRegister: () => void;
}

const DataCatalog: React.FC<DataCatalogProps> = ({ onSelect, onRegister }) => {
  const [assets, setAssets] = useState<DataAsset[]>(SAMPLE_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'geography' | 'poi' | 'enterprise'>('all');
  const [viewDetailAsset, setViewDetailAsset] = useState<DataAsset | null>(null);

  const filteredAssets = useMemo(() => {
    if (selectedCategory === 'all') return assets;
    return assets.filter(asset => asset.category === selectedCategory);
  }, [selectedCategory, assets]);

  const handleSaveAsset = (updatedAsset: DataAsset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    // Update the currently viewed asset to reflect changes immediately in the modal
    setViewDetailAsset(updatedAsset); 
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">数据资源目录</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              欢迎使用 GeoInsight Pro 空间数据分析平台。您可以在此浏览、查询和申请使用各类空间数据资源。
            </p>
          </div>
          <button 
            onClick={onRegister}
            className="flex-shrink-0 flex items-center px-5 py-2.5 bg-[#0052D9] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            注册新数据
          </button>
        </div>

        {/* Category Tabs */}
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

        {/* Assets Grid */}
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
                  <div className="flex items-center text-sm text-gray-600">
                     <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     更新频率: {asset.updateFrequency}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DataDetailModal 
          asset={viewDetailAsset} 
          onClose={() => setViewDetailAsset(null)}
          onAnalyze={onSelect}
          onSave={handleSaveAsset}
        />
      </div>
    </div>
  );
};

export default DataCatalog;