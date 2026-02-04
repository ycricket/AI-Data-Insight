import React, { useState, useMemo } from 'react';
import SqlEditor from './components/SqlEditor';
import DataMap from './components/DataMap';
import DataProfileDrawer from './components/DataProfileDrawer';
import AssetModal from './components/AssetModal';
import DataCatalog from './components/DataCatalog';
import AnalysisToolsModal from './components/AnalysisToolsModal';
import { MOCK_DATA_SOURCE, MOCK_ORDERS_DATA } from './constants';
import { QueryResult, GeoPoint, ViewMode, DataAsset } from './types';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'catalog' | 'workspace'>('catalog');
  
  // Workspace State
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE_ONLY);
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(null);
  const [selectedProfileCol, setSelectedProfileCol] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  
  // Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  // Extract Geo Data for Map (Memoized & Filtered by Selection)
  const geoData: GeoPoint[] = useMemo(() => {
    if (!result || result.rows.length === 0) return [];
    
    // Filter rows based on selection
    const selectedRows = result.rows.filter((_, idx) => selectedIndices.has(idx));

    // Check if rows have spatial data (checking first row is sufficient for mock)
    // Note: We check the data object itself, not the visible columns, so hidden columns still work.
    const firstRow = result.rows[0];
    const hasLat = 'lat' in firstRow || 'latitude' in firstRow;
    const hasLng = 'lng' in firstRow || 'longitude' in firstRow;

    if (hasLat && hasLng) {
      return selectedRows.map(row => ({
        lat: row.lat || row.latitude,
        lng: row.lng || row.longitude,
        id: row.order_id || row.id || row.adcode || row.poi_id || row.road_id || row.aoi_id || row.bldg_id || row.unit_id || row.ent_id || row.addr_id || row.address_id || Math.random(), 
        properties: row
      }));
    }
    return [];
  }, [result, selectedIndices]);

  // Run Query Mock Implementation
  const handleRunQuery = () => {
    if (!sql.trim()) return;
    
    setIsQuerying(true);
    setResult(null); // Clear previous
    setViewMode(ViewMode.TABLE_ONLY); // Reset view to table only
    setSelectedIndices(new Set()); // Reset selection

    // Simulate network delay
    setTimeout(() => {
      // Basic Mock SQL Parser
      const upperSql = sql.toUpperCase();
      let mockData: any[] = [];
      let columns: string[] = [];
      
      // Attempt to extract table name
      const fromMatch = sql.match(/FROM\s+([^\s;]+)/i);
      let tableName = fromMatch ? fromMatch[1].toLowerCase() : '';

      if (tableName && MOCK_DATA_SOURCE[tableName]) {
        // Use specific mock data
        mockData = [...MOCK_DATA_SOURCE[tableName]];
        // Derive visible columns from first item, EXCLUDING spatial columns for the table view
        if (mockData.length > 0) {
           columns = Object.keys(mockData[0]).filter(k => 
             !['lat', 'lng', 'latitude', 'longitude'].includes(k.toLowerCase())
           );
        }
      } else if (upperSql.includes('TBL_') || upperSql.includes('FROM')) {
        // Generic fallback using orders data
        mockData = [...MOCK_ORDERS_DATA];
        columns = Object.keys(mockData[0]).filter(k => 
             !['lat', 'lng', 'latitude', 'longitude'].includes(k.toLowerCase())
        );
      } else {
        columns = ['message'];
        mockData = [{ message: '未在模拟数据库中找到表。请尝试查询目录中的表。' }];
      }

      // Simple mock filtering
      if (upperSql.includes("WHERE")) {
          mockData = mockData.slice(0, 10);
      }
      
      // Limit logic
      const limitMatch = upperSql.match(/LIMIT\s+(\d+)/);
      const limit = limitMatch ? parseInt(limitMatch[1]) : 1000;
      mockData = mockData.slice(0, Math.min(limit, 5000));

      setResult({
        columns,
        rows: mockData,
        executionTime: Math.round(Math.random() * 200) + 50,
        totalRows: mockData.length
      });
      
      setIsQuerying(false);
    }, 800);
  };

  // Handle selecting an asset from Catalog
  const handleSelectAsset = (asset: DataAsset) => {
    setActiveTab('workspace');
    const defaultSql = `SELECT * \nFROM ${asset.id} \nLIMIT 100;`;
    setSql(defaultSql);
  };

  // Toggle row selection
  const toggleSelection = (idx: number) => {
    const newSelection = new Set(selectedIndices);
    if (newSelection.has(idx)) {
      newSelection.delete(idx);
    } else {
      if (newSelection.size >= 20) {
        alert("最多只能选择20条数据进行展示");
        return;
      }
      newSelection.add(idx);
    }
    setSelectedIndices(newSelection);
  };

  const handleShowMap = () => {
    if (selectedIndices.size === 0) return;
    setViewMode(ViewMode.SPLIT);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-16 bg-[#001529] flex flex-col items-center py-6 space-y-8 z-20 flex-shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white text-xl cursor-pointer" title="GeoInsight Pro">
          G
        </div>
        
        <nav className="flex flex-col space-y-4 w-full">
           <button 
            onClick={() => setActiveTab('catalog')}
            className={`p-3 mx-2 rounded-md transition-colors group relative ${activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
             <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">数据目录</span>
          </button>

          <button 
            onClick={() => setActiveTab('workspace')}
            className={`p-3 mx-2 rounded-md transition-colors group relative ${activeTab === 'workspace' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
             <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">分析工作台</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      {activeTab === 'catalog' ? (
        <DataCatalog 
          onSelect={handleSelectAsset} 
          onRegister={() => setIsAssetModalOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col h-screen min-w-0">
          
          {/* Top: SQL Editor (Approx 40% height) */}
          <div className="h-[40%] flex-shrink-0 z-10 shadow-sm relative">
            <SqlEditor 
              value={sql} 
              onChange={setSql} 
              onRun={handleRunQuery}
              isRunning={isQuerying}
            />
          </div>

          {/* Bottom: Results & Viz (Approx 60% height) */}
          <div className="flex-1 flex min-h-0 bg-white">
            
            {/* Table Panel */}
            <div className={`${viewMode === ViewMode.MAP_ONLY ? 'hidden' : 'flex'} flex-col flex-1 min-w-0 border-r border-gray-200 transition-all duration-300`}>
               {/* Result Header */}
               <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center bg-gray-50 h-12">
                 <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">查询结果</span>
                    {result && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>{result.totalRows} 行</span>
                        <span className="text-gray-300">|</span>
                        <span>耗时 {result.executionTime}ms</span>
                      </>
                    )}
                 </div>

                 <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      已选 <span className="font-semibold text-[#0052D9]">{selectedIndices.size}</span>/20
                    </div>
                    
                    <button 
                      onClick={handleShowMap}
                      disabled={selectedIndices.size === 0}
                      className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        selectedIndices.size > 0 
                          ? 'bg-[#0052D9] text-white hover:bg-blue-700 shadow-sm' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                      地图展示
                    </button>

                    <button 
                      onClick={() => setIsAnalysisOpen(true)}
                      disabled={!result || result.rows.length === 0}
                      className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors border ${
                         result && result.rows.length > 0
                          ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-[#0052D9] hover:border-[#0052D9]'
                          : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      分析探查
                    </button>
                 </div>
               </div>

               {/* Table Content */}
               <div className="flex-1 overflow-auto custom-scrollbar relative">
                  {isQuerying ? (
                    <div className="space-y-3 p-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 bg-gray-100 rounded animate-pulse w-full"></div>
                      ))}
                    </div>
                  ) : result ? (
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="w-12 px-3 py-2 bg-gray-50 text-center">
                            {/* Header checkbox could be Select All, but disabled due to limit */}
                            <span className="text-xs text-gray-400">#</span>
                          </th>
                          {result.columns.map(col => (
                            <th 
                              key={col} 
                              onClick={() => setSelectedProfileCol(col)}
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group whitespace-nowrap"
                            >
                              <div className="flex items-center space-x-1">
                                <span>{col}</span>
                                <svg className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {result.rows.map((row, idx) => (
                          <tr 
                            key={idx} 
                            onMouseEnter={() => setHoveredRowId(row.order_id || row.id)}
                            onMouseLeave={() => setHoveredRowId(null)}
                            className={`${(hoveredRowId === row.order_id || hoveredRowId === row.id) ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors cursor-default text-sm`}
                          >
                            <td className="w-12 px-3 py-2 text-center relative" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={selectedIndices.has(idx)}
                                onChange={() => toggleSelection(idx)}
                              />
                            </td>
                            {result.columns.map(col => (
                              <td key={col} className="px-4 py-2 whitespace-nowrap text-gray-700 overflow-hidden text-ellipsis">
                                {row[col] === null || row[col] === undefined ? 
                                  <span className="text-gray-300 italic">null</span> : 
                                  (col === 'customer_name' && row[col] ? '***' : String(row[col]))
                                }
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>请从目录选择数据或编写查询语句。</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Map Panel - Only visible if viewMode is not TABLE_ONLY */}
            {viewMode !== ViewMode.TABLE_ONLY && (
              <div className="flex-1 min-w-0 bg-gray-50 relative border-l border-gray-200 transition-all duration-300">
                 <DataMap 
                   data={geoData} 
                   hoveredRowId={hoveredRowId}
                   onMarkerClick={(id) => {
                     setHoveredRowId(id);
                   }}
                 />
                 
                 {/* Map Controls Overlay */}
                 <div className="absolute top-4 right-4 z-[500] bg-white rounded shadow-md flex flex-col divide-y divide-gray-100">
                    <button 
                      onClick={() => setViewMode(viewMode === ViewMode.SPLIT ? ViewMode.MAP_ONLY : ViewMode.SPLIT)}
                      title={viewMode === ViewMode.SPLIT ? "展开地图" : "分屏视图"}
                      className="p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    >
                       {viewMode === ViewMode.SPLIT ? (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4M4 20l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                       ) : (
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                       )}
                    </button>
                    
                    <button 
                      onClick={() => setViewMode(ViewMode.TABLE_ONLY)}
                      title="隐藏地图"
                      className="p-2 text-gray-600 hover:bg-gray-50 hover:text-red-600"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawers & Modals */}
      <DataProfileDrawer 
        isOpen={!!selectedProfileCol}
        onClose={() => setSelectedProfileCol(null)}
        columnName={selectedProfileCol}
        data={result?.rows || []}
      />

      <AssetModal 
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
      />

      <AnalysisToolsModal 
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        data={result?.rows || []}
        columns={result?.columns || []}
      />

    </div>
  );
};

export default App;
