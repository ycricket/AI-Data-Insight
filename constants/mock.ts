// Helper to generate random coordinates near Beijing
const genCoords = () => ({
  lat: 39.9042 + (Math.random() - 0.5) * 0.12,
  lng: 116.4074 + (Math.random() - 0.5) * 0.15
});

// Mock Data Source for all tables (Row Data for SQL Execution)
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

export const INITIAL_SQL = `-- 查询运输中的高价值订单
SELECT * 
FROM tbl_poi 
LIMIT 50;`;
