import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';

export type CommentData = any;

export const fetchPostComments = async ({ postDocumentId, pagination }: any) => {
  try {
    const query = qs.stringify({
      populate: {
        user: {
          fields: ['username'],
          populate: {
            profile: {
              populate: {
                avatar: {
                  fields: ['alternativeText', 'width', 'height', 'formats'],
                },
              },
              fields: ['id'],
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
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const fetchRelatedComments = async ({ topCommentDocumentId, pagination }: any) => {
  try {
    const query = qs.stringify({
      populate: {
        user: {
          fields: ['username'],
          populate: {
            profile: {
              populate: {
                avatar: {
                  fields: ['alternativeText', 'width', 'height', 'formats'],
                },
              },
              fields: ['id'],
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
                profile: {
                  populate: {
                    avatar: {
                      fields: ['alternativeText', 'width', 'height', 'formats'],
                    },
                  },
                  fields: ['id'],
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
          documentId: topCommentDocumentId,
        },
      },
      pagination,
    });

    const res: any = await apiClient.get(`/comments/?${query}`);
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createComment = async (commentData: CommentData) => {
  const query = qs.stringify({
    populate: {
      user: {
        fields: ['username'],
        populate: {
          profile: {
            populate: {
              avatar: {
                fields: ['alternativeText', 'width', 'height', 'formats'],
              },
            },
            fields: ['id'],
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
              profile: {
                populate: {
                  avatar: {
                    fields: ['alternativeText', 'width', 'height', 'formats'],
                  },
                },
                fields: ['id'],
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
  try {
    const res = await apiClient.post(`/comments?${query}`, {
      data: commentData,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteComment = async (documentId: string) => {
  try {
    const res = await apiClient.delete(`/comments/${documentId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
