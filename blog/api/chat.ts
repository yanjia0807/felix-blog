import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';

export type ChatData = any;

export const fetchChats = async ({ pageParam }: any) => {
  const { pagination, documentId } = pageParam;

  const query = qs.stringify({
    populate: {
      users: {
        populate: {
          fields: ['username', 'email'],
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      lastMessage: {
        fields: ['createdAt', 'content'],
      },
      chatStatuses: {
        filters: {
          user: {
            documentId,
          },
        },
      },
    },
    filters: {
      users: {
        documentId: {
          $contains: documentId,
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
          fields: ['username', 'email'],
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
        },
        chatStatuses: {
          populate: {
            user: {
              fields: ['username', 'email'],
            },
          },
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
      populate: {
        users: {
          fields: ['username', 'email'],
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
        },
        chatStatuses: {
          populate: {
            user: {
              fields: ['username', 'email'],
            },
          },
          filters: {
            user: {
              documentId: userDocumentIds[0],
            },
          },
        },
      },
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
  return (res.data && res.data[0]) || null;
};

export const createChat = async ({ users }: any) => {
  const res = await apiClient.post(`/chats/init`, {
    users,
  });
  return res.data;
};

export const updateChatStatus = async ({ documentId }: any) => {
  const res = await apiClient.put(`/chat-statuses/${documentId}`, { data: { unreadCount: 0 } });
  return res.data;
};
