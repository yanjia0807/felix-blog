import _ from 'lodash';
import qs from 'qs';
import { isImage, FileTypeNum } from '@/utils/file';
import { apiClient } from './api-client';
import { uploadFiles } from './file';

export type PostData = any;
export type UpdatePostLikedData = any;

export const fetchPosts = async ({ pageParam }: any) => {
  const {
    pagination,
    filters: { title, authorName, createdAtFrom, createdAtTo, tags },
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
      files: {
        populate: {
          file: true,
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
  const { pagination, userDocumentId, status } = pageParam;

  if (status === 'draft') {
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
        documentId: userDocumentId,
      },
    },
    pagination,
    sort: 'createdAt:desc',
  };

  const query = qs.stringify(params);

  const res = await apiClient.get(`/posts?${query}`);
  res.data = res.data.map((item: any) => ({
    ...item,
    status: 'published',
  }));
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
        files: {
          populate: {
            file: true,
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
    let coverId;
    if (formData.cover) {
      const coverRes = await uploadFiles(formData.cover.uri);
      coverId = coverRes.id;
    }

    let files: any = [];

    const images = _.filter(formData.images, (item: any) => isImage(item.fileType));
    const imageUris = _.map(images, 'uri');

    if (imageUris.length > 0) {
      const imageRes = await uploadFiles(imageUris);
      files = files.concat(
        _.map(imageRes, (item, i) => ({
          file: item.id,
          fileInfo: {},
        })),
      );
    }

    const videos = _.filter(formData.images, (item: any) => item.fileType === FileTypeNum.Video);
    const videoUris = _.map(videos, (item: any) => item.detail.uri);

    if (videoUris.length > 0) {
      const videoRes = await uploadFiles(videoUris);
      const thumbnails = _.map(videos, (item: any) => item.uri);
      const thumbnailRes = await uploadFiles(thumbnails);
      files = files.concat(
        _.map(videoRes, (item, i) => ({
          file: item.id,
          fileInfo: thumbnailRes[i],
        })),
      );
    }

    if (formData.recordings.length > 0) {
      const recordingRes = await uploadFiles(_.map(formData.recordings, 'uri'));
      files = files.concat(
        _.map(recordingRes, (item, i) => ({
          file: item.id,
          fileInfo: {},
        })),
      );
    }

    const poi =
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
      ]);

    const tags = formData.tags.map((item: any) => item.documentId);

    const data = {
      title: formData.title,
      cover: coverId,
      content: formData.content,
      author: formData.author,
      poi,
      tags,
      files,
    };

    const res = await apiClient.post(`/posts?status=${formData.status}`, { data });
    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const editPost = async (formData: PostData) => {
  try {
    let coverId;
    if (formData.cover) {
      if (formData.cover.id) {
        coverId = formData.cover.id;
      } else {
        const coverRes = await uploadFiles(formData.cover.uri);
        coverId = coverRes.id;
      }
    } else {
      coverId = null;
    }

    let files: any = [];
    const images = _.filter(formData.images, (item: any) => isImage(item.fileType));
    const imageRes = await Promise.all(
      _.map(images, async (item: any) => {
        if (item.id) {
          return {
            file: item.data.file.id,
            fileInfo: item.data.fileInfo
          }
        } else {
          const res = await uploadFiles(item.uri);
          return {
            file: res.id,
            fileInfo: {},
          };
        }
      }),
    );

    if (imageRes.length > 0) {
      files = files.concat(imageRes);
    }

    const videos = _.filter(formData.images, (item: any) => item.fileType === FileTypeNum.Video);
    const videoRes = await Promise.all(
      _.map(videos, async (item: any) => {
        if (item.id) {
          return {
            file: item.data.file.id,
            fileInfo: item.data.fileInfo
          }
        } else {
          const res = await uploadFiles(item.detail.uri);
          const thumbnailRes = await uploadFiles(item.uri);
          return {
            file: res.id,
            fileInfo: thumbnailRes,
          };
        }
      }),
    );

    if (videoRes.length > 0) {
      files = files.concat(videoRes);
    }

    const recordings = formData.recordings;
    const recordingRes = await Promise.all(
      _.map(recordings, async (item: any) => {
        if (item.id) {
          return {
            file: item.data.file.id,
            fileInfo: item.data.fileInfo
          }
        } else {
          const res = await uploadFiles(item.uri);
          return {
            file: res.id,
            fileInfo: {},
          };
        }
      }),
    );

    if (recordingRes.length > 0) {
      files = files.concat(recordingRes);
    }

    const poi =
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
      ]);

    const tags = formData.tags.map((item: any) => item.documentId);

    const data = {
      title: formData.title,
      cover: coverId,
      content: formData.content,
      author: formData.author,
      poi,
      tags,
      files,
    };

    const res = await apiClient.put(`/posts/${formData.documentId}?status=${formData.status}`, {
      data,
    });

    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deletePost = async ({ documentId }: any) => {
  try {
    await apiClient.delete(`/posts/${documentId}`);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const unpublishPost = async ({ documentId }: any) => {
  try {
    await apiClient.put(`/posts/${documentId}/unpublish`, { data: {} });
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
