import { MOCK_DATA_SOURCE, SAMPLE_ASSETS } from '../../constants';
import { DataAsset, QueryResult } from '../../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dataApiService = {
  /**
   * 获取数据资产列表
   */
  getDataAssets: async (category?: string): Promise<DataAsset[]> => {
    await delay(300);
    if (category && category !== 'all') {
      return SAMPLE_ASSETS.filter(asset => asset.category === category);
    }
    return SAMPLE_ASSETS;
  },

  /**
   * 获取单个资产详情
   */
  getDataAssetById: async (id: string): Promise<DataAsset | undefined> => {
    await delay(200);
    return SAMPLE_ASSETS.find(asset => asset.id === id);
  },

  /**
   * 执行 SQL 查询 (模拟)
   */
  executeQuery: async (sql: string): Promise<QueryResult> => {
    await delay(600 + Math.random() * 400); // Simulate processing time

    const cleanSql = sql.trim().toLowerCase();
    
    // Simple parser to extract table name: FROM table_name
    const fromMatch = cleanSql.match(/from\s+([^\s;]+)/);
    const tableName = fromMatch ? fromMatch[1] : '';

    if (!tableName) {
      throw new Error("无效的 SQL: 无法解析表名");
    }

    const dataSource = MOCK_DATA_SOURCE[tableName];

    if (!dataSource) {
       // Return empty result or error for unknown table
       return {
         columns: [],
         rows: [],
         executionTime: 0,
         totalRows: 0
       };
    }

    // Limit logic (Mock implementation of LIMIT)
    let limit = 100;
    const limitMatch = cleanSql.match(/limit\s+(\d+)/);
    if (limitMatch) {
      limit = parseInt(limitMatch[1], 10);
    }

    const rows = dataSource.slice(0, limit);
    
    // Extract columns (exclude large geo fields for table view usually, but here we keep simple)
    // Filter out some raw lat/lng if we want cleaner columns, but keeping them is fine for now.
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      columns,
      rows,
      executionTime: Math.floor(Math.random() * 200) + 50,
      totalRows: dataSource.length
    };
  }
};
