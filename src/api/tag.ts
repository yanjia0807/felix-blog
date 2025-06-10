import qs from 'qs';
import { apiClient } from '../utils/api-client';

export const fetchPopularTags = async ({ limit = 20 }: any) => {
  const query = qs.stringify({
    limit,
  });
  const res = await apiClient.get(`/tags/popular/?${query}`);

  return res.data;
};

export const fetchPopularPageTags = async ({ pageParam }: any) => {
  const { pagination, keywords } = pageParam;
  const query = qs.stringify(
    {
      pagination,
      keywords,
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/tags/popular-page/?${query}`);
  return res;
};
