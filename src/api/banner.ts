import qs from 'qs';
import { apiClient } from '../utils/api-client';

export const fetchBanners = async ({ pageParam }: any) => {
  const filters: any = {
    $and: [
      {
        isActive: true,
      },
    ],
  };

  if (pageParam.params.blockUsers) {
    filters['$and'].push({
      author: {
        documentId: {
          $notIn: pageParam.params.blockUsers,
        },
      },
    });
  }

  const populate = {
    image: true,
    link: true,
    author: {
      populate: {
        avatar: {
          fields: ['alternativeText', 'width', 'height', 'formats'],
        },
      },
    },
  };

  const query = qs.stringify({
    filters,
    populate,
    sort: 'order:asc',
    pagination: pageParam.pagination,
  });

  const res = await apiClient.get(`/banners?${query}`);
  return res;
};
