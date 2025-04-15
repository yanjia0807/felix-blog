import qs from 'qs';
import { apiClient } from './api-client';

export const fetchAllTags = async ({ name }: any) => {
  const query = name
    ? qs.stringify({
        filters: { name: { $contains: name } },
      })
    : '';

  const res = await apiClient.get(`/tags?${query}`);
  return res.data;
};

export const fetchCoverTags = async ({ pageParam }: any) => {
  const { pagination } = pageParam;

  const query = qs.stringify(
    {
      populate: {
        posts: {
          count: true,
        },
      },
      filters: {
        asCover: true,
      },
      sort: 'createdAt:desc',
      pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/tags?${query}`);
  return res;
};

export const fetchTags = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;
  const query: any = qs.stringify(
    {
      populate: {
        posts: {
          count: true,
        },
      },
      filters: filters.keyword ? { name: { $contains: filters.keyword } } : undefined,
      sort: 'createdAt:desc',
      pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/tags?${query}`);
  return res;
};
