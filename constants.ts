import { DataAsset } from './types';

export const THEME_COLOR = '#0052D9'; // Tech Blue

export const SAMPLE_ASSETS: DataAsset[] = [
  // --- 基础地理数据 (Geography) ---
  {
    id: 'tbl_admin_div',
    name: '行政区划数据',
    category: 'geography',
    type: 'table',
    updateFrequency: '每年',
    rowCount: 3200,
    hasGeo: true,
    description: '省、市、区县三级行政区划边界及中心点。',
    details: '包含全国范围内的省、市、区县行政区划数据，提供标准的行政区划代码（ADCODE）、行政区名称以及中心点坐标。',
    coverage: '全国',
    schema: [
      { name: 'adcode', type: 'string', description: '行政区划代码' },
      { name: 'name', type: 'string', description: '行政区名称' },
      { name: 'level', type: 'string', description: '行政级别' },
      { name: 'lat', type: 'number', description: '中心点纬度' },
      { name: 'lng', type: 'number', description: '中心点经度' },
    ]
  },
  {
    id: 'tbl_roads',
    name: '道路路网数据',
    category: 'geography',
    type: 'table',
    updateFrequency: '每月',
    rowCount: 150000,
    hasGeo: true,
    description: '城市主干道、次干道及支路路网信息。',
    details: '高精度的城市路网矢量数据，包含道路名称、道路等级、限速信息以及道路中心线几何信息。适用于路径规划和交通分析。',
    coverage: '一线及新一线城市',
    schema: [
      { name: 'road_id', type: 'string', description: '道路ID' },
      { name: 'name', type: 'string', description: '道路名称' },
      { name: 'class', type: 'string', description: '道路等级' },
      { name: 'length_km', type: 'number', description: '长度(公里)' },
    ]
  },
  {
    id: 'tbl_address',
    name: '标准地址库',
    category: 'geography',
    type: 'table',
    updateFrequency: '每日',
    rowCount: 5000000,
    hasGeo: true,
    description: '包含省市区街道门牌号的标准化地址信息。',
    details: '清洗并标准化的地址数据库，解决了地址写法不一的问题。包含完整的行政区划层级和精确的地理坐标，支持地址解析与匹配。',
    coverage: '全国重点城市',
    schema: [
      { name: 'address_id', type: 'string', description: '地址ID' },
      { name: 'full_address', type: 'string', description: '标准地址全称' },
      { name: 'province', type: 'string', description: '省份' },
      { name: 'city', type: 'string', description: '城市' },
      { name: 'lat', type: 'number', description: '纬度' },
      { name: 'lng', type: 'number', description: '经度' },
    ]
  },
  {
    id: 'tbl_aoi',
    name: 'AOI (兴趣面) 数据',
    category: 'geography',
    type: 'table',
    updateFrequency: '每月',
    rowCount: 20000,
    hasGeo: true,
    description: '住宅小区、商圈、公园等区域的地理围栏。',
    details: 'Area of Interest 数据，精确描述了现实世界中各类区域的边界范围，如购物中心轮廓、小区边界等，用于分析区域内的覆盖情况。',
    coverage: '主要省会城市',
    schema: [
      { name: 'aoi_id', type: 'string', description: 'AOI ID' },
      { name: 'name', type: 'string', description: '区域名称' },
      { name: 'type', type: 'string', description: '区域类型' },
      { name: 'area_sqm', type: 'number', description: '面积(平方米)' },
    ]
  },
  {
    id: 'tbl_buildings',
    name: '楼栋轮廓数据',
    category: 'geography',
    type: 'table',
    updateFrequency: '季度',
    rowCount: 80000,
    hasGeo: true,
    description: '建筑物底面轮廓及楼层高度信息。',
    details: '详细的建筑物矢量数据，包含楼栋的高度、层数以及具体的地理轮廓，适用于城市规划和3D可视化展示。',
    coverage: '北京市、上海市',
    schema: [
      { name: 'bldg_id', type: 'string', description: '楼栋ID' },
      { name: 'height', type: 'number', description: '高度' },
      { name: 'floors', type: 'number', description: '层数' },
      { name: 'usage', type: 'string', description: '用途' },
    ]
  },
  {
    id: 'tbl_units',
    name: '楼栋单元数据',
    category: 'geography',
    type: 'table',
    updateFrequency: '季度',
    rowCount: 250000,
    hasGeo: false,
    description: '楼栋内部的单元划分及户室结构信息。',
    details: '关联至楼栋的单元明细数据，描述了楼栋内部的结构，如一梯两户、单元号等，是网格化管理的最小颗粒度数据。',
    coverage: '试点社区',
    schema: [
      { name: 'unit_id', type: 'string', description: '单元ID' },
      { name: 'bldg_id', type: 'string', description: '所属楼栋' },
      { name: 'unit_no', type: 'string', description: '单元号' },
      { name: 'total_rooms', type: 'number', description: '总户数' },
    ]
  },

  // --- POI数据 (POI) ---
  {
    id: 'tbl_poi',
    name: '全国POI兴趣点',
    category: 'poi',
    type: 'table',
    updateFrequency: '每周',
    rowCount: 12000000,
    hasGeo: true,
    description: '餐饮、购物、交通等各类兴趣点位置信息。',
    details: 'Point of Interest 数据，涵盖了餐饮服务、购物服务、生活服务、体育休闲等20多个大类，包含名称、类别、地址及坐标。',
    coverage: '全国',
    schema: [
      { name: 'poi_id', type: 'string', description: 'POI ID' },
      { name: 'name', type: 'string', description: '名称' },
      { name: 'category', type: 'string', description: '类别' },
      { name: 'lat', type: 'number', description: '纬度' },
      { name: 'lng', type: 'number', description: '经度' },
    ]
  },

  // --- 企业数据 (Enterprise) ---
  {
    id: 'tbl_ent_info',
    name: '企业基础信息',
    category: 'enterprise',
    type: 'table',
    updateFrequency: '实时',
    rowCount: 300000,
    hasGeo: false,
    description: '工商注册企业的基本属性信息。',
    details: '包含企业的统一社会信用代码、注册资金、成立日期、企业类型、经营状态等核心工商数据。',
    coverage: '全量工商企业',
    schema: [
      { name: 'ent_id', type: 'string', description: '企业ID' },
      { name: 'ent_name', type: 'string', description: '企业名称' },
      { name: 'reg_capital', type: 'number', description: '注册资本' },
      { name: 'est_date', type: 'date', description: '成立日期' },
      { name: 'status', type: 'string', description: '经营状态' },
    ]
  },
  {
    id: 'tbl_ent_addr',
    name: '企业经营地址',
    category: 'enterprise',
    type: 'table',
    updateFrequency: '每月',
    rowCount: 280000,
    hasGeo: true,
    description: '企业实际办公及经营场所的空间位置。',
    details: '区别于注册地址，该数据集记录了企业的实际经营所在地，并已进行坐标化处理，适用于商业选址和竞品分析。',
    coverage: '活跃经营企业',
    schema: [
      { name: 'addr_id', type: 'string', description: '地址ID' },
      { name: 'ent_id', type: 'string', description: '企业ID' },
      { name: 'op_address', type: 'string', description: '经营地址' },
      { name: 'lat', type: 'number', description: '纬度' },
      { name: 'lng', type: 'number', description: '经度' },
    ]
  }
];

// Helper to generate random coordinates near Beijing
const genCoords = () => ({
  lat: 39.9042 + (Math.random() - 0.5) * 0.12,
  lng: 116.4074 + (Math.random() - 0.5) * 0.15
});

// Mock Data Source for all tables
export const MOCK_DATA_SOURCE: Record<string, any[]> = {
  'tbl_admin_div': Array.from({ length: 50 }).map((_, i) => ({
    adcode: `1101${String(i + 1).padStart(2, '0')}`,
    name: ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区'][i % 8] + (i > 7 ? `_${i}` : ''),
    level: '区县',
    ...genCoords()
  })),
  'tbl_roads': Array.from({ length: 50 }).map((_, i) => ({
    road_id: `RD_${2024000 + i}`,
    name: ['长安街', '建国路', '复兴路', '三环路', '四环路', '广渠路', '西直门外大街', '中关村大街'][i % 8],
    class: ['主干道', '快速路', '次干道'][i % 3],
    length_km: Number((Math.random() * 15 + 1).toFixed(2)),
    ...genCoords()
  })),
  'tbl_address': Array.from({ length: 50 }).map((_, i) => ({
    address_id: `ADDR_${10000 + i}`,
    full_address: `北京市朝阳区建国路${Math.floor(Math.random() * 200)}号院${i + 1}号楼`,
    province: '北京市',
    city: '北京市',
    ...genCoords()
  })),
  'tbl_aoi': Array.from({ length: 50 }).map((_, i) => ({
    aoi_id: `AOI_${i + 100}`,
    name: ['国贸中心', '望京SOHO', '朝阳公园', '三里屯太古里', '中关村软件园'][i % 5] + `_${i}`,
    type: ['商务写字楼', '住宅小区', '购物中心', '公园绿地', '科技园区'][i % 5],
    area_sqm: Math.floor(Math.random() * 100000) + 5000,
    ...genCoords()
  })),
  'tbl_buildings': Array.from({ length: 50 }).map((_, i) => ({
    bldg_id: `BLDG_${i + 500}`,
    height: Math.floor(Math.random() * 150) + 10,
    floors: Math.floor(Math.random() * 40) + 3,
    usage: ['商业', '住宅', '办公', '综合'][i % 4],
    ...genCoords()
  })),
  'tbl_units': Array.from({ length: 50 }).map((_, i) => ({
    unit_id: `UNIT_${i + 2000}`,
    bldg_id: `BLDG_${i % 10 + 500}`,
    unit_no: `${Math.floor(i / 10) + 1}单元`,
    total_rooms: 12 + Math.floor(Math.random() * 6)
  })),
  'tbl_poi': Array.from({ length: 50 }).map((_, i) => ({
    poi_id: `POI_${i + 8000}`,
    name: ['星巴克', '肯德基', '全家便利店', '中国银行', '中石化加油站'][i % 5] + ` (No.${i})`,
    category: ['餐饮', '购物', '生活服务', '金融', '汽车服务'][i % 5],
    ...genCoords()
  })),
  'tbl_ent_info': Array.from({ length: 50 }).map((_, i) => ({
    ent_id: `ENT_${90000 + i}`,
    ent_name: ['未来科技有限公司', '创新商贸有限公司', '云端网络服务社', '通过物流集团', '美好生活餐饮'][i % 5] + `_${i}`,
    reg_capital: Math.floor(Math.random() * 5000) + 50,
    est_date: `20${10 + Math.floor(Math.random() * 14)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`,
    status: ['在业', '存续', '迁入'][i % 3]
  })),
  'tbl_ent_addr': Array.from({ length: 50 }).map((_, i) => ({
    addr_id: `OP_${7000 + i}`,
    ent_id: `ENT_${90000 + i}`,
    op_address: `北京市海淀区中关村大街${Math.floor(Math.random() * 100)}号`,
    ...genCoords()
  }))
};

// Fallback data
export const MOCK_ORDERS_DATA = Array.from({ length: 50 }).map((_, i) => ({
  order_id: `ORD-${2024000 + i}`,
  status: i % 5 === 0 ? '已取消' : i % 3 === 0 ? '已送达' : '运输中',
  amount: Math.floor(Math.random() * 500) + 20,
  customer_name: `客户 ${i + 1}`,
  ...genCoords()
}));

export const INITIAL_SQL = `-- 查询运输中的高价值订单
SELECT * 
FROM tbl_poi 
LIMIT 50;`;
