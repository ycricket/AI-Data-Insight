import { MOCK_DATA_SOURCE } from '../../constants'; // Keep MOCK_DATA_SOURCE for SQL execution simulation
import { MOCK_API_LIST_RESPONSE, MOCK_API_DETAIL_RESPONSES } from '../../constants/apiMock';
import { DataAsset, QueryResult, SchemaField } from '../../types';
import { ApiTableDetail, ApiTableListItem } from '../../types/api';

// --- Adapters ---

const mapApiTypeToUiType = (apiType: string): SchemaField['type'] => {
  const t = apiType.toLowerCase();
  if (t.includes('int') || t.includes('numeric') || t.includes('double') || t.includes('float')) return 'number';
  if (t.includes('date') || t.includes('time')) return 'date';
  if (t.includes('bool')) return 'boolean';
  return 'string';
};

const mapDataKindToCategory = (kind: number): DataAsset['category'] => {
  switch (kind) {
    case 1: return 'geography';
    case 2: return 'poi';
    case 3: return 'enterprise';
    default: return 'geography';
  }
};

const transformListItemToAsset = (item: ApiTableListItem): DataAsset => {
  return {
    id: item.name, // Use table name as ID for SQL compatibility
    name: item.zhName,
    category: mapDataKindToCategory(item.dataKind),
    type: 'table',
    rowCount: item.numRows,
    updateFrequency: '未知', // List doesn't provide this usually
    hasGeo: item.dataKind === 1 || item.dataKind === 2, // Simple guess based on kind
    description: item.description,
    details: item.description,
    coverage: '未知',
    schema: [] // Empty schema for list items
  };
};

const transformDetailToAsset = (detail: ApiTableDetail): DataAsset => {
  const schema: SchemaField[] = detail.columnDtos.map(col => ({
    name: col.name,
    type: mapApiTypeToUiType(col.type),
    description: col.zhName + (col.comment ? ` (${col.comment})` : '')
  }));

  const hasGeo = detail.columnDtos.some(col => 
    col.type === 'geometry' || ['lat', 'lng', 'latitude', 'longitude', 'geom'].includes(col.name)
  );

  return {
    id: detail.name,
    name: detail.zhName,
    category: mapDataKindToCategory(detail.dataKind),
    type: 'table',
    rowCount: detail.numRows,
    updateFrequency: detail.updateFrequencyName || '未知',
    hasGeo: hasGeo,
    description: detail.description,
    details: detail.businessDescription,
    coverage: detail.dataRange,
    schema: schema
  };
};

// --- Service ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dataApiService = {
  /**
   * 获取数据资产列表 (模拟调用 /api/temp-show/list-table)
   */
  getDataAssets: async (category?: string): Promise<DataAsset[]> => {
    await delay(300);
    
    // Filter at API level (simulation)
    let rawList = MOCK_API_LIST_RESPONSE;
    
    // If category is provided, we map UI category back to dataKind for filtering
    if (category && category !== 'all') {
      const kindMap: Record<string, number> = { 'geography': 1, 'poi': 2, 'enterprise': 3 };
      const targetKind = kindMap[category];
      if (targetKind) {
        rawList = rawList.filter(item => item.dataKind === targetKind);
      }
    }

    return rawList.map(transformListItemToAsset);
  },

  /**
   * 获取单个资产详情 (模拟调用 /api/temp-show/table-detail)
   */
  getDataAssetById: async (id: string): Promise<DataAsset | undefined> => {
    await delay(200);
    // id in UI is table name (e.g., 'tbl_admin_div')
    const detail = MOCK_API_DETAIL_RESPONSES[id];
    
    if (!detail) return undefined;
    return transformDetailToAsset(detail);
  },

  /**
   * 执行 SQL 查询 (Mock DB Engine)
   * This logic remains similar but uses the MOCK_DATA_SOURCE row data.
   */
  executeQuery: async (sql: string): Promise<QueryResult> => {
    await delay(500 + Math.random() * 300);

    const cleanSql = sql.trim().toLowerCase();
    const fromMatch = cleanSql.match(/from\s+([^\s;]+)/);
    const tableName = fromMatch ? fromMatch[1] : '';

    if (!tableName) {
      throw new Error("无效的 SQL: 无法解析表名");
    }

    const dataSource = MOCK_DATA_SOURCE[tableName];

    if (!dataSource) {
       return {
         columns: [],
         rows: [],
         executionTime: 0,
         totalRows: 0
       };
    }

    let limit = 100;
    const limitMatch = cleanSql.match(/limit\s+(\d+)/);
    if (limitMatch) {
      limit = parseInt(limitMatch[1], 10);
    }

    const rows = dataSource.slice(0, limit);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      columns,
      rows,
      executionTime: Math.floor(Math.random() * 200) + 50,
      totalRows: dataSource.length
    };
  }
};
