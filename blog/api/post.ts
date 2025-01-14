import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';

export type PostData = any;
export type UpdatePostLikedData = any;

export const fetchPosts = async ({ pageParam }: any) => {
  const {
    pagination,
    filters: {
      title,
      authorName,
      createdAtFrom,
      createdAtTo,
      isIncludeImage,
      isIncludeAudio,
      tags,
    },
  } = pageParam;

  const filters: any = {};
  if (!_.isNil(title) && !_.isEmpty(title)) {
    filters.title = {
      $containsi: title,
    };
  }

  if (!_.isNil(authorName) && !_.isEmpty(authorName)) {
    filters.author = {
      username: {
        $containsi: authorName,
      },
    };
  }

  if (!_.isNil(createdAtFrom)) {
    filters.createdAt = {
      $gte: createdAtFrom,
    };
  }

  if (!_.isNil(createdAtTo)) {
    filters.createdAt = {
      $lte: createdAtTo,
    };
  }

  if (!_.isNil(tags) && !_.isEmpty(tags)) {
    filters.tags = {
      $in: tags,
    };
  }

  if (isIncludeImage) {
    filters.attachments = {
      type: {
        $contains: 'image',
      },
    };
  }

  if (isIncludeAudio) {
    filters.attachments = {
      type: {
        $contains: 'audio',
      },
    };
  }

  const query = qs.stringify({
    populate: {
      author: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      tags: true,
      poi: true,
      cover: {
        fields: ['alternativeText', 'width', 'height', 'formats'],
      },
      attachments: {
        populate: {
          files: true,
        },
      },
      comments: {
        count: true,
      },
    },
    filters,
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
      author: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      tags: true,
      poi: true,
      cover: {
        fields: ['formats', 'name', 'alternativeText'],
      },
      attachments: {
        populate: {
          files: true,
        },
      },
    },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/posts/additional?${query}`);
  return res;
};

export const fetchUserPosts = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;

  const query = qs.stringify({
    populate: {
      tags: true,
      poi: true,
      author: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      likedByUsers: {
        count: true,
      },
      comments: {
        count: true,
      },
      cover: {
        fields: ['formats', 'name', 'alternativeText'],
      },
    },
    filters: {
      author: {
        documentId: userDocumentId,
      },
    },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchUserPhotos = async ({ pageParam }: any) => {
  const { pagination, userId } = pageParam;
  const query = qs.stringify({
    userId,
    pagination,
  });
  const res = await apiClient.get(`/posts/photos?${query}`);
  return res;
};

export const fetchPost = async ({ documentId }: any) => {
  const query = qs.stringify(
    {
      populate: {
        tags: true,
        poi: true,
        cover: true,
        author: {
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
        },
        attachments: {
          populate: {
            files: true,
          },
        },
        comments: {
          count: true,
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

export const createPost = async (data: PostData) => {
  try {
    const res = await apiClient.post(`/posts`, { data });

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

export const fetchRecentAuthors = async () => {
  const res = await apiClient.get(`/posts/recent-authors`);
  return res.data;
};
