import qs from 'qs';
import { apiClient } from '../utils/api-client';

export type NotificationData = any;

export const fetchNotifications = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;
  const query = qs.stringify({
    filters: {
      user: {
        documentId: userDocumentId,
      },
    },
    sort: ['createdAt:desc'],
    pagination,
  });
  const res = await apiClient.get(`/notifications?${query}`);
  return res;
};

export const fetchNotificationCount = async () => {
  const res = await apiClient.get(`/notifications/count`);
  return res.data;
};

export const updateNotificationReadState = async ({ documentId, data }: any) => {
  const res = await apiClient.put(`/notifications/${documentId}`, {
    data,
  });
  return res.data;
};

export const updateNotificationsReadState = async () => {
  const res = await apiClient.put(`/notifications/all-read`);
  return res.data;
};

export const fetchNotification = async ({ documentId }: any) => {
  const query = qs.stringify(
    {
      populate: {},
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await apiClient.get(`/notifications/${documentId}?${query}`);
  return res.data;
};

export const updateFriendRequestNotification = async ({
  documentId,
  friendRequest,
  state,
}: any) => {
  const res = await apiClient.put(`/notifications/${documentId}/friend-request`, {
    data: {
      friendRequest,
      state,
    },
  });
  return res.data;
};
