import qs from 'qs';
import { apiClient } from './api-client';

export const createFriendship = async ({ recipient }: any) => {
  const res = await apiClient.post(`/friendships`, {
    data: {
      recipient,
    },
  });
  return res.data;
};

export const updateFriendship = async ({ documentId, state, notificationId }: any) => {
  const res = await apiClient.put(`/friendships/${documentId}?notificationId=${notificationId}`, {
    data: {
      state,
    },
  });
  return res.data;
};

export const deleteFriendship = async ({ id }: any) => {
  const res = await apiClient.delete(`/friendship/${id}`);
  return res.data;
};

export const fetchFriendshipWithUser = async ({ requester, recipient }: any) => {
  const query = qs.stringify({
    filters: {
      $or: [
        {
          requester: {
            documentId: requester,
          },
          recipient: {
            documentId: recipient,
          },
          state: 'accepted',
        },
        {
          requester: {
            documentId: recipient,
          },
          recipient: {
            documentId: requester,
          },
          state: 'accepted',
        },
      ],
    },
  });
  const res = await apiClient.get(`/friendships?${query}`);
  return res.data;
};

export const fetchFriends = async ({ documentId }: any) => {
  const res = await apiClient.get(`/posts/recent-authors`);
  return res.data;
};
