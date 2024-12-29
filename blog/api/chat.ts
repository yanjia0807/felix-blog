import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';

export type ChatData = any;

export const fetchChats = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;

  const query = qs.stringify({
    populate: {
      users: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      lastMessage: true,
      chatStatuses: {
        filters: {
          user: {
            documentId: userDocumentId,
          },
        },
      },
    },
    filters: {
      users: {
        documentId: {
          $contains: userDocumentId,
        },
      },
    },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/chats?${query}`);
  return res;
};

export const fetchChat = async ({ documentId, userDocumentId }: any) => {
  const query = qs.stringify(
    {
      populate: {
        users: {
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
        },
        chatStatuses: {
          filters: {
            user: {
              documentId: userDocumentId,
            },
          },
        },
      },
      filters: {
        documentId,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await apiClient.get(`/chats/${documentId}?${query}`);
  return res.data;
};

export const fetchChatByUsers = async ({ userDocumentIds }: any) => {
  const query = qs.stringify(
    {
      filters: {
        $and: [
          {
            users: {
              documentId: {
                $contains: userDocumentIds[0],
              },
            },
          },
          {
            users: {
              documentId: {
                $contains: userDocumentIds[1],
              },
            },
          },
        ],
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await apiClient.get(`/chats?${query}`);
  return res.data;
};

export const createChat = async ({ users }: any) => {
  const query = qs.stringify({});
  const res = await apiClient.post(`/chats/init?${query}`, {
    data: {
      users,
    },
  });
  return res.data;
};

export const updateChatStatus = async ({ documentId }: any) => {
  const res = await apiClient.put(`/chat-statuses/${documentId}`, { data: { unreadCount: 0 } });
  return res.data;
};
