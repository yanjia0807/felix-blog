import qs from 'qs';
import { apiClient } from './api-client';

export const createFriendRequest = async (params: any) => {
  const res = await apiClient.post(`/friend-requests`, {
    data: params,
  });
  return res.data;
};
