import qs from 'qs';
import { apiClient } from './api-client';

export const fetchOnlineUser = async ({ pageParam }: any) => {
  const { pagination } = pageParam;

  const query = qs.stringify(
    {
      pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );
  const res = await apiClient.get(`/online-users/friends?${query}`);
  return res;
};
