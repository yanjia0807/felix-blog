import qs from 'qs';
import { apiClient } from '../utils/api-client';

export const fetchBanners = async ({ pageParam }: any) => {
  const { pagination } = pageParam;
  const query = qs.stringify({
    filters: {
      isActive: true,
    },
    populate: {
      image: true,
      link: true,
      author: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
    },
    sort: 'order:asc',
    pagination,
  });
  const res = await apiClient.get(`/banners?${query}`);
  return res;
};
