import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';

export type NotificationData = any;

export const fetchNotifications = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;
  const query = qs.stringify({
    filter: {
      user: userDocumentId,
    },
    sort: ['state:asc', 'createdAt:desc'],
    pagination,
  });
  const res = await apiClient.get(`/notifications?${query}`);
  return res;
};

export const fetchNotificationCount = async () => {
  const res = await apiClient.get(`/notifications/count`);
  return res;
};

export const fetchUnreadNotifications = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;
  const query = qs.stringify({
    filter: {
      user: userDocumentId,
      state: 'unread',
    },
    pagination,
  });
  const res = await apiClient.get(`/notifications?${query}`);
  return res;
};

export const updateNotificationState = async ({ documentId, state }: any) => {
  const res = await apiClient.put(`/notifications/${documentId}`, {
    data: {
      state,
    },
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
