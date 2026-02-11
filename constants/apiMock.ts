import { ApiTableDetail, ApiTableListItem } from "../types/api";

// 1. 列表接口 Mock 数据
export const MOCK_API_LIST_RESPONSE: ApiTableListItem[] = [
  {
    id: 101,
    name: "tbl_admin_div",
    zhName: "行政区划数据",
    description: "省、市、区县三级行政区划边界及中心点",
    dataKind: 1,
    dataKindName: "基础地理",
    numRows: 3200
  },
  {
    id: 102,
    name: "tbl_roads",
    zhName: "道路路网数据",
    description: "城市主干道、次干道及支路路网信息",
    dataKind: 1,
    dataKindName: "基础地理",
    numRows: 150000
  },
  {
    id: 103,
    name: "tbl_address",
    zhName: "标准地址库",
    description: "包含省市区街道门牌号的标准化地址信息",
    dataKind: 1,
    dataKindName: "基础地理",
    numRows: 5000000
  },
  {
    id: 104,
    name: "tbl_aoi",
    zhName: "AOI (兴趣面) 数据",
    description: "住宅小区、商圈、公园等区域的地理围栏",
    dataKind: 1,
    dataKindName: "基础地理",
    numRows: 20000
  },
  {
    id: 105,
    name: "tbl_buildings",
    zhName: "楼栋轮廓数据",
    description: "建筑物底面轮廓及楼层高度信息",
    dataKind: 1,
    dataKindName: "基础地理",
    numRows: 80000
  },
  {
    id: 106,
    name: "tbl_units",
    zhName: "楼栋单元数据",
    description: "楼栋内部的单元划分及户室结构信息",
    dataKind: 1,
    dataKindName: "基础地理",
    numRows: 250000
  },
  {
    id: 201,
    name: "tbl_poi",
    zhName: "全国POI兴趣点",
    description: "餐饮、购物、交通等各类兴趣点位置信息",
    dataKind: 2,
    dataKindName: "POI",
    numRows: 12000000
  },
  {
    id: 301,
    name: "tbl_ent_info",
    zhName: "企业基础信息",
    description: "工商注册企业的基本属性信息",
    dataKind: 3,
    dataKindName: "企业数据",
    numRows: 300000
  },
  {
    id: 302,
    name: "tbl_ent_addr",
    zhName: "企业经营地址",
    description: "企业实际办公及经营场所的空间位置",
    dataKind: 3,
    dataKindName: "企业数据",
    numRows: 280000
  }
];

// 2. 详情接口 Mock 数据 (Key 为表名，模拟通过 ID 查找)
export const MOCK_API_DETAIL_RESPONSES: Record<string, ApiTableDetail> = {
  "tbl_admin_div": {
    ...MOCK_API_LIST_RESPONSE[0],
    businessDescription: "包含全国范围内的省、市、区县行政区划数据，提供标准的行政区划代码（ADCODE）、行政区名称以及中心点坐标。",
    dataRange: "全国",
    updateFrequencyName: "每年",
    columnDtos: [
      { name: "adcode", type: "varchar", zhName: "行政区划代码", comment: "唯一标识" },
      { name: "name", type: "varchar", zhName: "行政区名称", comment: "" },
      { name: "level", type: "varchar", zhName: "行政级别", comment: "省/市/区" },
      { name: "lat", type: "numeric", zhName: "中心点纬度", comment: "" },
      { name: "lng", type: "numeric", zhName: "中心点经度", comment: "" }
    ]
  },
  "tbl_roads": {
    ...MOCK_API_LIST_RESPONSE[1],
    businessDescription: "高精度的城市路网矢量数据，包含道路名称、道路等级、限速信息以及道路中心线几何信息。",
    dataRange: "一线及新一线城市",
    updateFrequencyName: "每月",
    columnDtos: [
      { name: "road_id", type: "varchar", zhName: "道路ID", comment: "主键" },
      { name: "name", type: "varchar", zhName: "道路名称", comment: "" },
      { name: "class", type: "varchar", zhName: "道路等级", comment: "主干道/次干道" },
      { name: "length_km", type: "numeric", zhName: "长度", comment: "单位：公里" },
      { name: "geom", type: "geometry", zhName: "空间对象", comment: "LineString" }
    ]
  },
  "tbl_address": {
    ...MOCK_API_LIST_RESPONSE[2],
    businessDescription: "清洗并标准化的地址数据库，解决了地址写法不一的问题。包含完整的行政区划层级和精确的地理坐标。",
    dataRange: "全国重点城市",
    updateFrequencyName: "每日",
    columnDtos: [
      { name: "address_id", type: "varchar", zhName: "地址ID", comment: "" },
      { name: "full_address", type: "varchar", zhName: "标准地址全称", comment: "" },
      { name: "province", type: "varchar", zhName: "省份", comment: "" },
      { name: "city", type: "varchar", zhName: "城市", comment: "" },
      { name: "lat", type: "numeric", zhName: "纬度", comment: "" },
      { name: "lng", type: "numeric", zhName: "经度", comment: "" }
    ]
  },
  "tbl_aoi": {
    ...MOCK_API_LIST_RESPONSE[3],
    businessDescription: "Area of Interest 数据，精确描述了现实世界中各类区域的边界范围，如购物中心轮廓、小区边界等。",
    dataRange: "主要省会城市",
    updateFrequencyName: "每月",
    columnDtos: [
      { name: "aoi_id", type: "varchar", zhName: "AOI ID", comment: "" },
      { name: "name", type: "varchar", zhName: "区域名称", comment: "" },
      { name: "type", type: "varchar", zhName: "区域类型", comment: "住宅/商业/公园" },
      { name: "area_sqm", type: "numeric", zhName: "面积", comment: "单位：平方米" },
      { name: "geom", type: "geometry", zhName: "空间对象", comment: "Polygon" }
    ]
  },
  "tbl_buildings": {
    ...MOCK_API_LIST_RESPONSE[4],
    businessDescription: "详细的建筑物矢量数据，包含楼栋的高度、层数以及具体的地理轮廓，适用于城市规划和3D可视化展示。",
    dataRange: "北京市、上海市",
    updateFrequencyName: "季度",
    columnDtos: [
      { name: "bldg_id", type: "varchar", zhName: "楼栋ID", comment: "" },
      { name: "height", type: "numeric", zhName: "高度", comment: "米" },
      { name: "floors", type: "int4", zhName: "层数", comment: "" },
      { name: "usage", type: "varchar", zhName: "用途", comment: "商业/住宅" },
      { name: "geom", type: "geometry", zhName: "空间对象", comment: "Polygon" }
    ]
  },
  "tbl_units": {
    ...MOCK_API_LIST_RESPONSE[5],
    businessDescription: "关联至楼栋的单元明细数据，描述了楼栋内部的结构，如一梯两户、单元号等。",
    dataRange: "试点社区",
    updateFrequencyName: "季度",
    columnDtos: [
      { name: "unit_id", type: "varchar", zhName: "单元ID", comment: "" },
      { name: "bldg_id", type: "varchar", zhName: "所属楼栋", comment: "外键" },
      { name: "unit_no", type: "varchar", zhName: "单元号", comment: "" },
      { name: "total_rooms", type: "int4", zhName: "总户数", comment: "" }
    ]
  },
  "tbl_poi": {
    ...MOCK_API_LIST_RESPONSE[6],
    businessDescription: "Point of Interest 数据，涵盖了餐饮服务、购物服务、生活服务、体育休闲等20多个大类。",
    dataRange: "全国",
    updateFrequencyName: "每周",
    columnDtos: [
      { name: "poi_id", type: "varchar", zhName: "POI ID", comment: "" },
      { name: "name", type: "varchar", zhName: "名称", comment: "" },
      { name: "category", type: "varchar", zhName: "类别", comment: "餐饮/购物" },
      { name: "lat", type: "numeric", zhName: "纬度", comment: "" },
      { name: "lng", type: "numeric", zhName: "经度", comment: "" }
    ]
  },
  "tbl_ent_info": {
    ...MOCK_API_LIST_RESPONSE[7],
    businessDescription: "包含企业的统一社会信用代码、注册资金、成立日期、企业类型、经营状态等核心工商数据。",
    dataRange: "全量工商企业",
    updateFrequencyName: "实时",
    columnDtos: [
      { name: "ent_id", type: "varchar", zhName: "企业ID", comment: "唯一标识" },
      { name: "ent_name", type: "varchar", zhName: "企业名称", comment: "" },
      { name: "reg_capital", type: "numeric", zhName: "注册资本", comment: "万元" },
      { name: "est_date", type: "date", zhName: "成立日期", comment: "" },
      { name: "status", type: "varchar", zhName: "经营状态", comment: "在业/存续" }
    ]
  },
  "tbl_ent_addr": {
    ...MOCK_API_LIST_RESPONSE[8],
    businessDescription: "区别于注册地址，该数据集记录了企业的实际经营所在地，并已进行坐标化处理。",
    dataRange: "活跃经营企业",
    updateFrequencyName: "每月",
    columnDtos: [
      { name: "addr_id", type: "varchar", zhName: "地址ID", comment: "" },
      { name: "ent_id", type: "varchar", zhName: "企业ID", comment: "" },
      { name: "op_address", type: "varchar", zhName: "经营地址", comment: "" },
      { name: "lat", type: "numeric", zhName: "纬度", comment: "" },
      { name: "lng", type: "numeric", zhName: "经度", comment: "" }
    ]
  }
};
