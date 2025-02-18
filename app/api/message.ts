import qs from 'qs';
import { apiClient } from './api-client';

export type MessageData = any;

export const fetchMessagesByChat = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;
  const query = qs.stringify({
    populate: {
      sender: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      receiver: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      messageStatuses: true,
    },
    filters: {
      chat: {
        documentId: filters.chatDocumentId,
      },
      documentId: {
        $notIn: filters.excludeDocumentIds,
      },
    },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/messages?${query}`);
  return res;
};

export const createMessage = async (data: any) => {
  const query = qs.stringify({
    populate: {
      fields: ['createdAt'],
      chat: {
        fields: ['id', 'documentId'],
      },
      sender: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
        fields: ['id', 'documentId'],
      },
      receiver: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
        fields: ['id', 'documentId'],
      },
      messageStatuses: true,
    },
  });

  const res = await apiClient.post(`/messages?${query}`, { data });
  return res.data;
};
