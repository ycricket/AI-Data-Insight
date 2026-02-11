import React, { useState, useMemo } from 'react';
import { 
  WorkspaceAI, 
  SqlEditor, 
  ResultTable, 
  DataMap, 
  DataCatalog, 
  AnalysisToolsModal, 
  AssetModal 
} from './components';
import { dataApiService } from './services';
import { DataAsset, QueryResult, GeoPoint, ViewMode } from './types';

const App: React.FC = () => {
  // 视图控制
  const [activeView, setActiveView] = useState<'catalog' | 'workspace'>('catalog');
  const [workspaceMode, setWorkspaceMode] = useState<'ai' | 'sql'>('ai');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE_ONLY);

  // 数据状态
  const [currentAsset, setCurrentAsset] = useState<DataAsset | null>(null);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(null);

  // 弹窗状态
  const [modals, setModals] = useState({ asset: false, analysis: false });

  // 执行查询逻辑 (通过 Service 层)
  const handleRunQuery = async (targetSql: string) => {
    if (!targetSql.trim()) return;
    
    setIsQuerying(true);
    setResult(null);
    setSelectedIndices(new Set()); // 重置选择

    try {
      const data = await dataApiService.executeQuery(targetSql);
      setResult(data);
    } catch (error) {
      console.error("Query execution failed:", error);
      // 这里可以添加一个 Toast 提示错误，目前简单处理
      setResult({
        columns: ['error'],
        rows: [{ error: '查询执行失败，请检查 SQL 语法或表名。' }],
        executionTime: 0,
        totalRows: 0
      });
    } finally {
      setIsQuerying(false);
    }
  };

  // 提取地理数据用于地图展示
  const geoData: GeoPoint[] = useMemo(() => {
    if (!result) return [];
    
    // 如果有勾选，仅展示勾选的；否则展示全部（限制数量防止卡顿，地图组件内部通常需要做聚合优化，这里简单处理）
    const rowsToMap = selectedIndices.size > 0 
      ? result.rows.filter((_, idx) => selectedIndices.has(idx))
      : result.rows;

    return rowsToMap
      .map(row => ({
        lat: Number(row.lat || row.latitude),
        lng: Number(row.lng || row.longitude),
        id: row.id || row.ent_id || row.poi_id || Math.random(),
        properties: row
      }))
      .filter(p => !isNaN(p.lat) && !isNaN(p.lng) && p.lat !== 0 && p.lng !== 0);
  }, [result, selectedIndices]);

  const handleAssetSelect = (asset: DataAsset) => {
    setCurrentAsset(asset); 
    setActiveView('workspace'); 
    setWorkspaceMode('ai'); 
    
    // 自动生成并执行一条预览 SQL
    const initialSql = `SELECT * FROM ${asset.id} LIMIT 50;`;
    setSql(initialSql); 
    handleRunQuery(initialSql);
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden font-sans text-gray-900">
      
      {/* 侧边导航 */}
      <div className="w-16 bg-[#001529] flex flex-col items-center py-6 space-y-8 z-30 flex-shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-lg cursor-default select-none shadow-lg shadow-blue-900/20">G</div>
        <nav className="flex flex-col space-y-6">
          <div className="relative group">
            <button 
              onClick={() => setActiveView('catalog')} 
              className={`p-2 rounded transition-colors ${activeView === 'catalog' ? 'text-white bg-blue-600 shadow-md shadow-blue-900/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              title="数据资源中心"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
          
          <div className="relative group">
            <button 
              onClick={() => { setActiveView('workspace'); setWorkspaceMode('ai'); }} 
              className={`p-2 rounded transition-colors ${activeView === 'workspace' ? 'text-white bg-blue-600 shadow-md shadow-blue-900/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              title="智能分析台"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {activeView === 'catalog' ? (
        <DataCatalog 
          onSelect={handleAssetSelect} 
          onRegister={() => setModals({ ...modals, asset: true })} 
        />
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* 工作台顶部：模式切换 */}
          <header className="h-12 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-20 flex-shrink-0">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
               <span>当前分析:</span>
               <span className={`px-2 py-0.5 rounded border ${currentAsset ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>
                 {currentAsset?.name || '未选择'}
               </span>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setWorkspaceMode('ai')} 
                className={`px-4 py-1 text-[11px] font-bold rounded-md transition-all ${workspaceMode === 'ai' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ✨ 智能助理
              </button>
              <button 
                onClick={() => setWorkspaceMode('sql')} 
                className={`px-4 py-1 text-[11px] font-bold rounded-md transition-all ${workspaceMode === 'sql' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                💻 专家 SQL
              </button>
            </div>
            {/* 占位，保持中间居中 */}
            <div className="w-20 text-right"></div>
          </header>

          <div className="h-[40%] flex-shrink-0 border-b border-gray-200 flex flex-col min-h-0">
            {workspaceMode === 'ai' ? (
              <WorkspaceAI 
                currentAsset={currentAsset} 
                onExecute={(newSql) => { 
                  setSql(newSql); 
                  handleRunQuery(newSql); 
                }} 
              />
            ) : (
              <SqlEditor 
                value={sql} 
                onChange={setSql} 
                onRun={() => handleRunQuery(sql)} 
                isRunning={isQuerying} 
              />
            )}
          </div>

          <main className="flex-1 flex min-h-0 bg-white relative">
            <section className={`${viewMode === ViewMode.MAP_ONLY ? 'hidden' : 'flex'} flex-col flex-1 border-r border-gray-200 min-w-0 h-full`}>
              <div className="h-10 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between text-[11px] flex-shrink-0">
                 <div className="flex items-center space-x-2 text-gray-400">
                    <span className="font-bold text-gray-700">结果预览</span>
                    {result && <span>{result.totalRows} 行 | {result.executionTime}ms</span>}
                    {selectedIndices.size > 0 && (
                      <span className={`ml-2 font-bold ${selectedIndices.size >= 20 ? 'text-orange-500' : 'text-blue-600'}`}>
                         已选择 {selectedIndices.size} 条
                      </span>
                    )}
                 </div>
                 <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setViewMode(ViewMode.SPLIT)} 
                      disabled={selectedIndices.size === 0 && !result} 
                      className="px-2 py-1 bg-blue-600 text-white rounded font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      空间展示
                    </button>
                    <button 
                      onClick={() => setModals({ ...modals, analysis: true })} 
                      disabled={!result}
                      className="px-2 py-1 border border-gray-300 rounded font-bold hover:bg-white transition-colors bg-white/50 disabled:opacity-50"
                    >
                      深度探查
                    </button>
                 </div>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <ResultTable 
                  result={result} 
                  loading={isQuerying} 
                  selectedIndices={selectedIndices} 
                  onSelectChange={setSelectedIndices} 
                  onHoverRow={setHoveredRowId} 
                />
              </div>
            </section>

            {viewMode !== ViewMode.TABLE_ONLY && (
              <section className="flex-1 bg-gray-100 relative min-w-0 h-full">
                <DataMap data={geoData} hoveredRowId={hoveredRowId} onMarkerClick={setHoveredRowId} />
                <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-2">
                  <button 
                    onClick={() => setViewMode(ViewMode.TABLE_ONLY)} 
                    className="p-2 bg-white rounded-lg shadow-md text-red-500 hover:bg-red-50 transition-colors"
                    title="关闭地图"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <button 
                    onClick={() => setViewMode(viewMode === ViewMode.SPLIT ? ViewMode.MAP_ONLY : ViewMode.SPLIT)} 
                    className="p-2 bg-white rounded-lg shadow-md text-blue-600 hover:bg-blue-50 transition-colors"
                    title={viewMode === ViewMode.SPLIT ? "全屏地图" : "分屏视图"}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {viewMode === ViewMode.SPLIT 
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      }
                    </svg>
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>
      )}

      {/* 全局模态框 */}
      <AssetModal isOpen={modals.asset} onClose={() => setModals({ ...modals, asset: false })} />
      
      {result && (
        <AnalysisToolsModal 
          isOpen={modals.analysis} 
          onClose={() => setModals({ ...modals, analysis: false })} 
          data={result.rows} 
          columns={result.columns} 
        />
      )}
    </div>
  );
};

export default App;