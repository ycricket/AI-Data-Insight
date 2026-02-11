// 对应后端 columnDtos
export interface ApiColumnDto {
  name: string;
  type: string; // "varchar", "int8", "geometry", etc.
  zhName: string;
  comment?: string;
  primaryKey?: number; // 1 or 0
}

// 对应后端 list-table 接口项
export interface ApiTableListItem {
  id: number;
  name: string; // 数据库表名
  zhName: string; // 中文显示名
  description: string;
  dataKind: 1 | 2 | 3; // 1: 基础地理, 2: POI, 3: 企业
  dataKindName: string;
  numRows: number;
  totalSize?: number;
}

// 对应后端 table-detail 接口响应
export interface ApiTableDetail extends ApiTableListItem {
  businessDescription?: string;
  dataRange?: string;
  updateFrequencyName?: string;
  columnDtos: ApiColumnDto[];
}

// 通用 API 响应结构
export interface ApiResponse<T> {
  code: number;
  data: T;
  success: boolean;
  message: string;
}
