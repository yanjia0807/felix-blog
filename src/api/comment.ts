import qs from 'qs';
import { apiClient } from '../utils/api-client';

export type CommentData = any;

export const fetchPostComments = async ({ pageParam }: any) => {
  const { postDocumentId, pagination } = pageParam;

  const query = qs.stringify({
    populate: {
      user: {
        fields: ['username'],
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      post: {
        fields: ['id'],
      },
      relatedComments: {
        count: true,
      },
    },
    sort: ['createdAt:desc'],
    filters: {
      post: {
        documentId: postDocumentId,
      },
      topComment: {
        $null: true,
      },
    },
    pagination,
  });
  const res: any = await apiClient.get(`/comments/?${query}`);
  return res;
};

export const fetchRelatedComments = async ({ pageParam }: any) => {
  const { topDocumentId, pagination } = pageParam;

  const query = qs.stringify({
    populate: {
      user: {
        fields: ['username'],
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      topComment: {
        fields: ['id'],
      },
      post: {
        fields: ['id'],
      },
      reply: {
        populate: {
          user: {
            fields: ['username'],
            populate: {
              avatar: {
                fields: ['alternativeText', 'width', 'height', 'formats'],
              },
            },
          },
        },
      },
      relatedComments: {
        count: true,
      },
    },
    sort: ['createdAt:desc'],
    filters: {
      topComment: {
        documentId: topDocumentId,
      },
    },
    pagination,
  });

  const res: any = await apiClient.get(`/comments/?${query}`);
  return res;
};

export const createComment = async (commentData: CommentData) => {
  const query = qs.stringify({
    populate: {
      user: {
        fields: ['username'],
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      post: {
        fields: ['id'],
      },
      topComment: {
        fields: ['id'],
      },
      reply: {
        populate: {
          user: {
            fields: ['username'],
            populate: {
              avatar: {
                fields: ['alternativeText', 'width', 'height', 'formats'],
              },
            },
          },
        },
      },
      relatedComments: {
        count: true,
      },
    },
  });

  const res = await apiClient.post(`/comments?${query}`, {
    data: commentData,
  });
  return res.data;
};

export const deleteComment = async (documentId: string) => {
  const res = await apiClient.delete(`/comments/${documentId}`);
  return res.data;
};
