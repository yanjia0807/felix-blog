import qs from 'qs';
import { apiClient } from './api-client';

export const createFriendship = async ({ receiver }: any) => {
  const res = await apiClient.post(`/friendships`, {
    data: {
      receiver,
    },
  });
  return res.data;
};

export const cancelFriendship = async ({ documentId }: any) => {
  const res = await apiClient.put(`/friendships/${documentId}/cancel`);
  return res.data;
};

export const fetchFriendship = async ({ sender, receiver }: any) => {
  const query = qs.stringify({
    filters: {
      $or: [
        {
          sender: {
            documentId: sender,
          },
          receiver: {
            documentId: receiver,
          },
          state: 'accepted',
        },
        {
          sender: {
            documentId: receiver,
          },
          receiver: {
            documentId: sender,
          },
          state: 'accepted',
        },
      ],
    },
  });

  const res = await apiClient.get(`/friendships?${query}`);
  return res.data.length > 0 ? res.data[0] : null;
};

export const fetchFriends = async ({ documentId }: any) => {
  const res = await apiClient.get(`/posts/recent-authors`);
  return res.data;
};
