import qs from 'qs';
import { amapClient } from './amap-client';

export const fetchPositionRound = async (params: any) => {
  try {
    const {
      pageParam: { location, page_num, page_size },
    } = params;
    const query = qs.stringify({
      location,
      page_num,
      page_size,
      radius: 100,
    });
    const res: any = await amapClient.get(`/v5/place/around?${query}`);
    if (!res.status) {
      throw new Error(res.info);
    }

    if (Number(res.infocode) !== 10000) {
      console.warn('fetch round failed', res);
      throw new Error(res.info);
    }

    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
