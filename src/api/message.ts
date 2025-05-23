import qs from 'qs';
import { apiClient } from '../utils/api-client';

export type MessageData = any;

export const fetchChatMessages = async ({ pageParam }: any) => {
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
      chat: {
        fields: ['id', 'documentId'],
      },
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
  });

  const res = await apiClient.post(`/messages?${query}`, { data });
  return res.data;
};
