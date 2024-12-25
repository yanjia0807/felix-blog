import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';

export type FollowData = any;

export const toggleFollow = async ({ following, follower, isFollowed }: FollowData) => {
  try {
    if (isFollowed) {
      const query = qs.stringify({
        filters: {
          following: {
            documentId: following,
          },
          follower: {
            documentId: follower,
          },
        },
      });
      const res = await apiClient.get(`/follows?${query}`);
      const followDocumentId = res.data[0].documentId;
      const res1 = await apiClient.delete(`/follows/${followDocumentId}`);
      return res1;
    } else {
      const data = {
        following,
        follower,
      };
      const res = await apiClient.post(`/follows`, { data });
      return res;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
