import qs from 'qs';
import { apiClient } from '../utils/api-client';

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
      $and: [
        {
          users: {
            documentId: {
              $contains: documentId,
            },
          },
        },
        {
          users: {
            documentId: {
              $notContains: documentId,
            },
          },
        },
      ],

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
          fields: ['username', 'email', 'isOnline'],
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
        },
        chatStatuses: {
          populate: {
            user: {
              fields: ['username', 'email', 'isOnline'],
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

export const fetchChatsUnreadCount = async () => {
  const res = await apiClient.get(`/chats/unread-count`);
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

export const createChat = async ({ userDocumentIds }: any) => {
  const res = await apiClient.post(`/chats/init`, {
    users: userDocumentIds,
  });
  return res.data;
};

export const deleteChat = async ({ documentId }: any) => {
  const res = await apiClient.delete(`/chats/${documentId}`);
  return res;
};

export const updateChatStatus = async ({ documentId }: any) => {
  const res = await apiClient.put(`/chat-statuses/${documentId}`, { data: { unreadCount: 0 } });
  return res.data;
};
