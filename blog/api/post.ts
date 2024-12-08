import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';

export type PostData = any;
export type UpdatePostLikedData = any;
export type UpdatePostFavoritedData = any;

export const fetchPosts = async ({ pageParam }: any) => {
  const { pagination } = pageParam;
  const query = qs.stringify({
    populate: {
      tags: true,
      author: {
        populate: {
          profile: {
            populate: ['avatar'],
          },
        },
      },
      cover: {
        fields: ['formats', 'name', 'alternativeText'],
      },
      blocks: {
        on: {
          'shared.attachment': {
            populate: {
              files: true,
            },
          },
        },
      },
    },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/posts/additional?${query}`);
  return res;
};

export const fetchRecommendPosts = async ({ pageParam }: any) => {
  const { pagination } = pageParam;
  const query = qs.stringify({
    populate: {
      tags: true,
      author: {
        populate: {
          profile: {
            populate: ['avatar'],
          },
        },
      },
      cover: {
        fields: ['formats', 'name', 'alternativeText'],
      },
      blocks: {
        on: {
          'shared.attachment': {
            populate: {
              files: true,
            },
          },
        },
      },
    },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/posts/additional?${query}`);
  return res;
};

export const fetchMyPosts = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;
  const query = qs.stringify({
    populate: {
      tags: true,
      author: {
        populate: {
          profile: {
            populate: ['avatar'],
          },
        },
      },
      likedByUsers: {
        count: true,
      },
      favoritedByUsers: {
        count: true,
      },
      comments: {
        count: true,
      },
      cover: {
        fields: ['formats', 'name', 'alternativeText'],
      },
    },
    // filters: {
    //   author: userDocumentId,
    // },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchMyPhotos = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;
  const query = qs.stringify({
    populate: {
      blocks: {
        on: {
          'shared.attachment': {
            populate: {
              files: true,
            },
          },
        },
      },
      cover: {
        fields: ['formats', 'name', 'alternativeText'],
      },
    },
    // filters: {
    //   author: userDocumentId,
    // },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchCount = async () => {
  const res = await apiClient.get(`/posts/count`);
  return res;
};

export const fetchPost = async ({ documentId }: any) => {
  const query = qs.stringify(
    {
      populate: {
        tags: true,
        cover: true,
        author: {
          populate: {
            profile: {
              populate: ['avatar'],
            },
          },
        },
        blocks: {
          on: {
            'shared.attachment': {
              populate: {
                files: true,
              },
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await apiClient.get(`/posts/${documentId}/additional?${query}`);
  return res.data;
};

export const createPost = async (postData: PostData) => {
  try {
    const res = await apiClient.post(`/posts`, {
      data: postData,
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updatePostLiked = async ({ documentId, postData }: UpdatePostLikedData) => {
  try {
    const query = qs.stringify({
      populate: {
        likedByUsers: {
          fields: ['documentId'],
        },
      },
    });
    const res = await apiClient.put(`/posts/${documentId}?${query}`, {
      data: postData,
    });
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updatePostFavorited = async ({ documentId, postData }: UpdatePostFavoritedData) => {
  try {
    const query = qs.stringify({});
    const res = await apiClient.put(`/posts/${documentId}?${query}`, {
      data: postData,
    });
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
