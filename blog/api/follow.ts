import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';

export type FollowData = any;

export const toggleFollow = async (data: FollowData) => {
  try {
    const res = await apiClient.post(`/follows`, {
      data,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
