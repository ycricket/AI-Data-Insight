export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  isSensitive?: boolean; // PII or confidential
  description?: string;
}

export interface DataAsset {
  id: string;
  name: string;
  category: 'geography' | 'poi' | 'enterprise'; // Updated categories
  type: 'table' | 'csv' | 'api';
  updateFrequency: string;
  rowCount: number;
  hasGeo: boolean;
  schema: SchemaField[];
  description: string; // Short description
  details?: string; // Long introduction
  coverage?: string; // Geographic coverage
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  executionTime: number;
  totalRows: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  id: string | number;
  properties: any;
}
