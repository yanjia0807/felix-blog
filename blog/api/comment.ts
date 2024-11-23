import _ from 'lodash';
import { apiClient } from './config';
import qs from 'qs';

export type CommentData = any;

export const fetchPostComments = async ({ postDocumentId }: any) => {
  try {
    const query = qs.stringify(
      {
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
        },
        order: 'createdAt:desc',
        filters: {
          post: {
            documentId: postDocumentId,
          },
          topComment: {
            $null: true,
          },
        },
      },
      {
        encodeValuesOnly: true,
      },
    );
    const res: any = await apiClient.get(`/comments/?${query}`);
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const fetchChildComments = async ({ topCommentDocumentId }: any) => {
  if (!topCommentDocumentId) return { data: [], meta: null };

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
      },
      order: 'createdAt:desc',
      filters: {
        topComment: {
          documentId: topCommentDocumentId,
        },
      },
    });

    const res: any = await apiClient.get(`/comments/?${query}`);
    return res;
  } catch (error) {}
};

export const fetchPostCommentTotal = async ({ postDocumentId }: any) => {
  try {
    const query = qs.stringify(
      {
        postDocumentId,
      },
      {
        encodeValuesOnly: true,
      },
    );
    const res: any = await apiClient.get(`/comments/total?${query}`);
    return res.data.total;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createComment = async (commentData: CommentData) => {
  try {
    const res = await apiClient.post(`/comments`, {
      data: commentData,
    });
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteComment = async (commentData: CommentData) => {
  try {
  } catch (error: any) {
    throw new Error(error.message);
  }
};
