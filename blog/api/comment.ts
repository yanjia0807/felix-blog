import { apiClient } from './config';
import qs from 'qs';

export type CommentData = any;

export const fetchPostComments = async ({ postDocumentId }: any) => {
  try {
    const query = qs.stringify(
      {
        populate: {
          user: {
            populate: {
              profile: {
                populate: ['avatar'],
              },
            },
          },
          parent: true,
          post: true,
        },
        pagination: { pageSize: -1 },
        order: 'createdAt:desc',
        filters: {
          post: {
            documentId: postDocumentId,
          },
        },
      },
      {
        encodeValuesOnly: true,
      },
    );
    const res = await apiClient.get(`/comments/?${query}`);
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createComment = async (commentData: CommentData) => {
  try {
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
