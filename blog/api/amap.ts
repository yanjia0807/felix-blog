import amapClient from './amap-client';

export const fetchPositionRound = async ({ location, page_num, page_size }: any) => {
  try {
    const query = {
      location,
      page_num,
      page_size,
      radius: 200,
    };

    const res: any = await amapClient.get(`/v5/place/around?${query}`);
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
