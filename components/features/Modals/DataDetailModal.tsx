import React, { useState, useEffect } from 'react';
import { DataAsset } from '../../../types';

interface DataDetailModalProps {
  asset: DataAsset | null;
  onClose: () => void;
  onAnalyze: (asset: DataAsset) => void;
  onSave?: (asset: DataAsset) => void;
}

const DataDetailModal: React.FC<DataDetailModalProps> = ({ asset, onClose, onAnalyze, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DataAsset | null>(null);

  useEffect(() => {
    if (asset) {
      setFormData(JSON.parse(JSON.stringify(asset))); // Deep copy
    }
  }, [asset]);

  useEffect(() => {
    // Reset edit mode when asset changes or closes
    if (!asset) setIsEditing(false);
  }, [asset]);

  if (!asset || !formData) return null;

  const handleSave = () => {
    if (onSave && formData) {
      onSave(formData);
      setIsEditing(false);
    }
  };

  const handleSchemaChange = (index: number, field: string, value: any) => {
    if (!formData) return;
    const newSchema = [...formData.schema];
    newSchema[index] = { ...newSchema[index], [field]: value };
    setFormData({ ...formData, schema: newSchema });
  };

  const handleAddSchemaField = () => {
      if (!formData) return;
      setFormData({
          ...formData,
          schema: [...formData.schema, { name: 'new_field', type: 'string', description: '' }]
      });
  };

  const handleRemoveSchemaField = (index: number) => {
      if (!formData) return;
      const newSchema = [...formData.schema];
      newSchema.splice(index, 1);
      setFormData({ ...formData, schema: newSchema });
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                 <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                 />
                 <div className="flex gap-2">
                    <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="text-xs font-medium border border-gray-300 rounded px-2 py-1"
                    >
                        <option value="geography">基础地理</option>
                        <option value="poi">POI数据</option>
                        <option value="enterprise">企业数据</option>
                    </select>
                    <code className="text-sm text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{formData.id}</code>
                 </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{asset.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        asset.category === 'geography' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        asset.category === 'poi' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        'bg-green-50 text-green-700 border-green-200'
                    }`}>
                        {asset.category === 'geography' ? '基础地理' : asset.category === 'poi' ? 'POI数据' : '企业数据'}
                    </span>
                </div>
                <code className="text-sm text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{asset.id}</code>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && onSave && (
               <button 
                onClick={() => setIsEditing(true)}
                className="text-gray-500 hover:text-blue-600 p-2 hover:bg-blue-50 rounded transition-colors text-sm font-medium flex items-center"
               >
                 <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 编辑
               </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* Introduction */}
            <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    资料简介
                </h3>
                {isEditing ? (
                    <div className="space-y-4">
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="简短描述"
                            rows={2}
                        />
                        <textarea
                            value={formData.details || ''}
                            onChange={(e) => setFormData({...formData, details: e.target.value})}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="详细介绍"
                            rows={4}
                        />
                    </div>
                ) : (
                    <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {asset.details || asset.description || "暂无详细介绍。"}
                    </p>
                )}
            </section>

            {/* Coverage & Basic Info */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        覆盖范围
                    </h3>
                    {isEditing ? (
                        <input 
                            type="text"
                            value={formData.coverage || ''}
                            onChange={(e) => setFormData({...formData, coverage: e.target.value})}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                            placeholder="例如：全国"
                        />
                    ) : (
                        <div className="text-gray-700 font-medium">
                            {asset.coverage || "未指定"}
                        </div>
                    )}
                </div>
                <div>
                     <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        基础信息
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex justify-between border-b border-gray-100 pb-1 items-center">
                            <span>数据量:</span>
                            <span className="font-mono text-gray-800 bg-gray-100 px-2 rounded" title="数据量不可修改">{formData.rowCount.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-100 pb-1 items-center">
                            <span>更新频率:</span>
                            {isEditing ? (
                                <input 
                                    type="text"
                                    value={formData.updateFrequency}
                                    onChange={(e) => setFormData({...formData, updateFrequency: e.target.value})}
                                    className="border border-gray-300 rounded px-2 py-0.5 w-32 text-right"
                                />
                            ) : (
                                <span className="text-gray-800">{asset.updateFrequency}</span>
                            )}
                        </li>
                    </ul>
                </div>
            </section>

             {/* Schema Preview */}
             <section>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8-4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                        数据结构 (Schema)
                    </h3>
                    {isEditing && (
                        <button onClick={handleAddSchemaField} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            + 添加字段
                        </button>
                    )}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">字段名</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">类型</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">描述</th>
                                {isEditing && <th className="px-4 py-2 text-center w-10">操作</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {formData.schema.map((field, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 font-mono text-blue-700">
                                        {isEditing ? (
                                            <input 
                                                value={field.name}
                                                onChange={(e) => handleSchemaChange(idx, 'name', e.target.value)}
                                                className="border border-gray-300 rounded px-1 py-0.5 w-full"
                                            />
                                        ) : field.name}
                                    </td>
                                    <td className="px-4 py-2 text-gray-500">
                                        {isEditing ? (
                                            <select 
                                                value={field.type}
                                                onChange={(e) => handleSchemaChange(idx, 'type', e.target.value)}
                                                className="border border-gray-300 rounded px-1 py-0.5 w-full text-xs"
                                            >
                                                <option value="string">string</option>
                                                <option value="number">number</option>
                                                <option value="boolean">boolean</option>
                                                <option value="date">date</option>
                                            </select>
                                        ) : field.type}
                                    </td>
                                    <td className="px-4 py-2 text-gray-700">
                                        {isEditing ? (
                                            <input 
                                                value={field.description || ''}
                                                onChange={(e) => handleSchemaChange(idx, 'description', e.target.value)}
                                                className="border border-gray-300 rounded px-1 py-0.5 w-full"
                                            />
                                        ) : (field.description || "-")}
                                    </td>
                                    {isEditing && (
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => handleRemoveSchemaField(idx)} className="text-red-400 hover:text-red-600">
                                                ×
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex justify-end gap-4">
          {isEditing ? (
            <>
                <button 
                    onClick={() => {
                        setIsEditing(false);
                        setFormData(JSON.parse(JSON.stringify(asset))); // Reset
                    }} 
                    className="px-6 py-2.5 text-sm text-gray-700 hover:bg-white border border-gray-300 rounded-md font-medium transition-colors"
                >
                    取消修改
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm font-medium transition-colors"
                >
                    保存修改
                </button>
            </>
          ) : (
            <>
                <button onClick={onClose} className="px-6 py-2.5 text-sm text-gray-700 hover:bg-white border border-gray-300 rounded-md font-medium transition-colors">关闭</button>
                <button 
                    onClick={() => {
                        onAnalyze(asset);
                        onClose();
                    }} 
                    className="px-6 py-2.5 text-sm text-white bg-[#0052D9] hover:bg-blue-700 rounded-md shadow-sm font-medium flex items-center transition-colors"
                >
                    开始分析 <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataDetailModal;