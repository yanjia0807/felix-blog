import { useCallback } from 'react';

// 中国地理边界范围 (粗略估算)
const CHINA_BOUNDS = {
  minLat: 18.0, // 最南端 - 曾母暗沙
  maxLat: 53.5, // 最北端 - 漠河
  minLng: 73.5, // 最西端 - 帕米尔高原
  maxLng: 135.0, // 最东端 - 黑龙江与乌苏里江交汇处
};

// 生成指定范围内的随机纬度
const getRandomLatitude = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// 生成指定范围内的随机经度
const getRandomLongitude = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// 确保坐标在中国境内
const ensureInChina = (lat: number, lng: number) => {
  return {
    lat: Math.max(CHINA_BOUNDS.minLat, Math.min(CHINA_BOUNDS.maxLat, lat)),
    lng: Math.max(CHINA_BOUNDS.minLng, Math.min(CHINA_BOUNDS.maxLng, lng)),
  };
};

// 生成随机POI类型
const getRandomPOIType = () => {
  const types = [
    'restaurant',
    'hotel',
    'attraction',
    'shop',
    'hospital',
    'school',
    'park',
    'museum',
  ];
  return types[Math.floor(Math.random() * types.length)];
};

// 生成随机中文名称
const generateRandomChineseName = (type: string) => {
  const prefixes: any = {
    restaurant: ['香', '好', '美', '金', '老'],
    hotel: ['华', '天', '君', '维', '香'],
    attraction: ['中华', '国家', '人民', '世纪', '东方'],
    shop: ['时尚', '精品', '潮流', '优选', '品质'],
  };

  const suffixes: any = {
    restaurant: ['餐厅', '饭店', '酒楼', '食府', '美食'],
    hotel: ['大酒店', '宾馆', '饭店', '国际', '度假村'],
    attraction: ['公园', '景区', '博物馆', '广场', '中心'],
    shop: ['商店', '专卖店', '购物中心', '商城', '超市'],
  };

  const prefix = prefixes[type]?.[Math.floor(Math.random() * prefixes[type].length)] || '';
  const suffix = suffixes[type]?.[Math.floor(Math.random() * suffixes[type].length)] || '';

  return prefix + suffix;
};

function useMarkerGen() {
  // 生成200个随机中国区域内的标记点
  const generateMarkers = useCallback((centerLng: number, centerLat: number, count = 200) => {
    const markersArray = [];
    const spread = 0.1; // 中心点周围的分布范围(经纬度)

    for (let i = 0; i < count; i++) {
      // 生成以中心点为基础的随机坐标
      let lat1 = centerLat + (Math.random() - 0.5) * spread * 2;
      let lng1 = centerLng + (Math.random() - 0.5) * spread * 2;

      // 确保坐标在中国境内
      let { lat, lng } = ensureInChina(lat1, lng1);

      const poiType = getRandomPOIType();

      markersArray.push({
        id: `marker-${i}-${Date.now()}`,
        latitude: lat,
        longitude: lng,
        poi: {
          id: i,
          name: generateRandomChineseName(poiType),
          location: `${lng.toFixed(6)},${lat.toFixed(6)}`,
          type: poiType,
          address: `中国某地${Math.floor(Math.random() * 100)}号`,
          // 其他模拟数据
          pname: '中国',
          cityname: ['北京', '上海', '广州', '深圳', '成都', '重庆', '杭州', '武汉'][
            Math.floor(Math.random() * 8)
          ],
          adname: ['区', '县', '市辖区'][Math.floor(Math.random() * 3)],
          pcode: '100000',
          adcode: Math.floor(100000 + Math.random() * 900000).toString(),
          citycode: ['010', '021', '020', '0755', '028', '023', '0571', '027'][
            Math.floor(Math.random() * 8)
          ],
        },
      });
    }

    return markersArray;
  }, []);

  return { generateMarkers };
}

export default useMarkerGen;
