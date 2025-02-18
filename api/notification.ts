import qs from 'qs';
import { apiClient } from './api-client';

export type NotificationData = any;

export const fetchNotifications = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;
  const query = qs.stringify({
    filters: {
      user: {
        documentId: filters.userDocumentId,
      },
      documentId: {
        $notIn: filters.excludeDocumentIds,
      },
    },
    sort: ['createdAt:desc'],
    pagination,
  });
  const res = await apiClient.get(`/notifications?${query}`);
  return res;
};

export const fetchNotificationUnreadCount = async () => {
  const res = await apiClient.get(`/notifications/unread-count`);
  return res;
};

export const updateNotificationState = async ({ documentId, data }: any) => {
  const res = await apiClient.put(`/notifications/${documentId}`, {
    data,
  });
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
