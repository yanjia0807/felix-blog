import qs from 'qs';
import { apiClient } from '../utils/api-client';

export type CommentData = any;

export const fetchPostComments = async ({ pageParam }: any) => {
  const { params, pagination } = pageParam;

  const filters: any = {
    $and: [
      {
        post: {
          documentId: params.postDocumentId,
        },
        topComment: {
          $null: true,
        },
      },
    ],
  };

  if (params.blockUsers) {
    filters['$and'].push({
      user: {
        documentId: {
          $notIn: params.blockUsers,
        },
      },
    });
  }

  const populate = {
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
  };

  const query = qs.stringify({
    filters,
    populate,
    pagination,
    sort: ['createdAt:desc'],
  });

  const res: any = await apiClient.get(`/comments/?${query}`);
  return res;
};

export const fetchPostCommentCount = async (params: any) => {
  const filters: any = {
    $and: [
      {
        post: {
          documentId: params.postDocumentId,
        },
      },
    ],
  };

  if (params.blockUsers) {
    filters['$and'].push({
      user: {
        documentId: {
          $notIn: params.blockUsers,
        },
      },
    });
  }

  const query = qs.stringify({
    filters,
    pagination: { pageSize: 0, withCount: true },
  });

  const res: any = await apiClient.get(`/comments/?${query}`);
  return res.meta.pagination.total;
};

export const fetchRelatedComments = async ({ pageParam }: any) => {
  const { params, pagination } = pageParam;

  const filters: any = {
    $and: [
      {
        topComment: {
          documentId: params.commentDocumentId,
        },
      },
    ],
  };

  if (params.blockUsers) {
    filters['$and'].push({
      user: {
        documentId: {
          $notIn: params.blockUsers,
        },
      },
    });
  }

  const populate = {
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
  };

  const query = qs.stringify({
    populate,
    sort: ['createdAt:desc'],
    filters,
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
