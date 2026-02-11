import React from 'react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">注册新数据资产</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数据名称</label>
            <input type="text" className="w-full border-gray-300 border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="例如：2024第一季度销售订单" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数据来源类型</label>
             <div className="grid grid-cols-2 gap-3">
               <button className="border border-[#0052D9] bg-blue-50 text-[#0052D9] py-2 rounded-md text-sm font-medium">数据库连接</button>
               <button className="border border-gray-200 bg-white text-gray-600 py-2 rounded-md text-sm hover:bg-gray-50">上传 CSV/Excel</button>
             </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
             <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
             <p className="text-sm text-gray-500">将文件拖拽至此 或 <span className="text-blue-600 cursor-pointer">点击浏览</span></p>
             <p className="text-xs text-gray-400 mt-1">支持 .csv, .xlsx (最大 50MB)</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="text-xs text-yellow-700">请声明此数据集是否包含 PII (个人身份信息) 或地理坐标。</p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">取消</button>
          <button onClick={onClose} className="px-4 py-2 text-sm text-white bg-[#0052D9] hover:bg-blue-700 rounded-md shadow-sm">注册资产</button>
        </div>
      </div>
    </div>
  );
};

export default AssetModal;