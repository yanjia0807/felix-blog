import qs from 'qs';
import { amapClient } from '../utils/amap-client';

export const fetchAround = async ({ pageParam }: any) => {
  const { location, page_num, page_size } = pageParam;
  const query = qs.stringify(
    {
      location: `${location?.latitude},${location?.longitude}`,
      page_num,
      page_size,
      radius: 500,
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res: any = await amapClient.get(`/v5/place/around?${query}`);
  if (!res.status) {
    throw new Error(res.info);
  }

  if (Number(res.infocode) !== 10000) {
    console.warn('fetch round failed', res);
    throw new Error(res.info);
  }

  return res;
};

export const fetchDistrict = async ({ keywords }: any) => {
  const query = qs.stringify({
    keywords,
    subdistrict: 1,
  });
  const res: any = await amapClient.get(`/v3/config/district?${query}`);
  if (!res.status) {
    throw new Error(res.info);
  }

  if (Number(res.infocode) !== 10000) {
    throw new Error(res.info);
  }
  return res;
};
