import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';
import { uploadFiles } from './file';

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
        fields: ['username'],
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      likedByUsers: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
        fields: ['username'],
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

  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchRecommendPosts = async ({ pageParam }: any) => {
  const { pagination } = pageParam;
  const query = qs.stringify({
    populate: {
      author: {
        fields: ['username'],
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      tags: true,
      poi: true,
      likedByUsers: {
        fields: ['username'],
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
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
    sort: 'createdAt:desc',
    pagination,
  });

  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchUserPosts = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;

  if (filters.status === 'draft') {
    return fetchUserDraftPosts({ pageParam });
  }

  const params = {
    populate: {
      tags: true,
      poi: true,
      author: {
        fields: ['username'],
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      likedByUsers: {
        fields: ['username'],
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      cover: {
        fields: ['formats', 'name', 'alternativeText'],
      },
    },
    filters: {
      author: {
        documentId: filters.userDocumentId,
      },
    },
    pagination,
    sort: 'createdAt:desc',
  };

  const query = qs.stringify(params);

  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchUserDraftPosts = async ({ pageParam }: any) => {
  const { pagination } = pageParam;

  const params = {
    pagination,
  };

  const query = qs.stringify(params);
  const res = await apiClient.get(`/posts/user-draft-posts?${query}`);
  res.data = res.data.map((item: any) => ({
    ...item,
    status: 'draft',
  }));
  return res;
};

export const fetchUserPhotos = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;
  const query = qs.stringify({
    userDocumentId,
    pagination,
  });
  const res = await apiClient.get(`/posts/photos?${query}`);
  return res;
};

export const fetchPost = async ({ documentId, status }: any) => {
  const query = qs.stringify(
    {
      populate: {
        tags: true,
        poi: true,
        cover: true,
        likedByUsers: {
          fields: ['username'],
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
        },
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
      status,
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await apiClient.get(`/posts/${documentId}?${query}`);
  return res.data;
};

export const createPost = async (formData: PostData) => {
  try {
    const coverId = formData.cover ? await uploadFiles(formData.cover.uri) : undefined;

    const attachments = [];
    const imageIds =
      formData.images.length > 0
        ? await uploadFiles(_.map(formData.images, (item: any) => item.uri))
        : [];

    if (imageIds.length > 0) {
      attachments.push({
        type: 'image',
        files: imageIds,
      });
    }

    const recordingIds =
      formData.recordings.length > 0
        ? await uploadFiles(_.map(formData.recordings, (item: any) => item._uri))
        : [];

    if (recordingIds.length > 0) {
      attachments.push({
        type: 'audio',
        files: recordingIds,
      });
    }

    const data = {
      title: formData.title,
      cover: coverId,
      content: formData.content,
      author: formData.author,
      poi:
        formData.poi &&
        _.pick(formData.poi, [
          'name',
          'location',
          'type',
          'typecode',
          'pname',
          'cityname',
          'adname',
          'address',
          'pcode',
          'adcode',
          'citycode',
        ]),
      tags: formData.tags.map((item: any) => item.documentId),
      attachments,
    };

    const res = await apiClient.post(`/posts?status=${formData.status}`, { data });
    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const editPost = async (formData: PostData) => {
  try {
    let coverId = undefined;
    if (formData.cover) {
      coverId = formData.cover.id ? formData.cover.id : await uploadFiles(formData.cover.uri);
    } else {
      coverId = null;
    }

    const attachments = [];
    let imageIds = [
      ..._.filter(formData.images, (item: any) => item.id).map((item: any) => item.id),
    ];
    const images = _.filter(formData.images, (item: any) => !item.id);

    imageIds =
      images.length > 0
        ? [...imageIds, ...(await uploadFiles(_.map(images, (item: any) => item.uri)))]
        : imageIds;

    if (imageIds.length > 0) {
      attachments.push({
        type: 'image',
        files: imageIds,
      });
    }

    let recordingIds = [
      ..._.filter(formData.recordings, (item: any) => item.id).map((item: any) => item.id),
    ];
    const recordings = _.filter(formData.recordings, (item: any) => !item.id);

    recordingIds =
      recordings.length > 0
        ? [...recordingIds, ...(await uploadFiles(_.map(recordings, (item: any) => item.uri)))]
        : recordingIds;

    if (recordingIds.length > 0) {
      attachments.push({
        type: 'audio',
        files: recordingIds,
      });
    }

    const data = {
      title: formData.title,
      cover: coverId,
      content: formData.content,
      author: formData.author,
      poi:
        formData.poi &&
        _.pick(formData.poi, [
          'name',
          'location',
          'type',
          'typecode',
          'pname',
          'cityname',
          'adname',
          'address',
          'pcode',
          'adcode',
          'citycode',
        ]),
      tags: formData.tags.map((item: any) => item.documentId),
      attachments,
    };
    const res = await apiClient.put(`/posts/${formData.documentId}?status=${formData.status}`, {
      data,
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
          fields: ['username'],
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
        },
      },
    });
    const res = await apiClient.put(`/posts/${documentId}?${query}`, {
      data: postData,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const fetchPostAuthors = async () => {
  const res = await apiClient.get(`/posts/recent-authors`);
  return res.data;
};
