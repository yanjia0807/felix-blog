import qs from 'qs';
import { apiClient } from './api-client';

export const fetchFeatures = async ({ pageParam }: any) => {
  const { pagination } = pageParam;
  const query = qs.stringify({
    filters: {
      post: {
        author: {
          $notNull: true,
        },
      },
    },
    populate: {
      image: {
        fields: ['alternativeText', 'width', 'height', 'formats'],
      },
      post: {
        populate: {
          author: {
            populate: {
              avatar: {
                fields: ['alternativeText', 'width', 'height', 'formats'],
              },
            },
          },
        },
      },
    },
    sort: 'order:asc',
    pagination,
  });
  const res = await apiClient.get(`/features?${query}`);
  return res;
};
