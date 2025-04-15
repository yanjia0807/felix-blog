import _ from 'lodash';
import qs from 'qs';
import { isVideo } from '@/utils/file';
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
  } else {
    filters.author = {
      $notNull: true,
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

  const query = qs.stringify(
    {
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
        cover: true,
        attachments: true,
        attachmentExtras: {
          populate: {
            attachment: true,
            thumbnail: true,
          },
        },
        comments: {
          count: true,
        },
      },
      filters,
      sort: 'createdAt:desc',
      pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchRecommendPosts = async ({ pageParam }: any) => {
  const { pagination } = pageParam;
  const query = qs.stringify({
    filters: {
      author: {
        $notNull: true,
      },
    },
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

export const fetchClzPosts = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;

  const query = qs.stringify(
    {
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
        cover: true,
        likedByUsers: {
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
          fields: ['username'],
        },
      },
      sort: 'createdAt:desc',
      pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );

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

export const fetchMapPosts = async ({ pageParam }: any) => {
  const { pagination } = pageParam;

  const filters: any = {
    poi: {
      $notNull: true,
    },
  };

  const query = qs.stringify(
    {
      populate: {
        author: {
          fields: ['username'],
          populate: {
            avatar: {
              fields: ['alternativeText', 'width', 'height', 'formats'],
            },
          },
        },
        poi: true,
        cover: {
          fields: ['alternativeText', 'width', 'height', 'formats'],
        },
      },
      filters,
      fields: ['title'],
      sort: 'createdAt:desc',
      pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/posts?${query}`);
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
        attachments: true,
        attachmentExtras: {
          populate: {
            attachment: true,
            thumbnail: true,
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
    let coverId = null;
    const attachmentExtras: any = [];

    if (formData.cover) {
      coverId = (await uploadFiles(formData.cover.uri)).id;

      if (isVideo(formData.cover.fileType)) {
        const thumbnailId = (await uploadFiles(formData.cover.thumbnail)).id;
        attachmentExtras.push({
          attachment: coverId,
          thumbnail: thumbnailId,
        });
      }
    }

    const uploadUris: any = [];
    _.forEach(formData.images, (item: any) => {
      uploadUris.push(item.uri);
      if (isVideo(item.fileType)) {
        uploadUris.push(item.thumbnail);
      }
    });

    _.forEach(formData.recordings, (item: any) => {
      uploadUris.push(item.uri);
    });

    const uploadRes = await uploadFiles(uploadUris);
    const attachments = _.map(
      [...formData.images, ...formData.recordings],
      (item: any) => _.find(uploadRes, ['uri', item.uri]).id,
    );

    _.forEach(formData.images, (item: any) => {
      if (isVideo(item.fileType)) {
        attachmentExtras.push({
          attachment: _.find(uploadRes, ['uri', item.uri]).id,
          thumbnail: _.find(uploadRes, ['uri', item.thumbnail]).id,
        });
      }
    });

    const poi =
      formData.poi &&
      _.pick(formData.poi, [
        'name',
        'longitude',
        'latitude',
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
      attachments,
      attachmentExtras,
    };

    const res = await apiClient.post(`/posts?status=${formData.status}`, { data });
    return res.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const editPost = async (formData: PostData) => {
  try {
    let coverId = null;
    const attachmentExtras: any = [];

    if (formData.cover) {
      if (formData.cover.id) {
        coverId = formData.cover.id;

        const extra = _.find(
          formData.attachmentExtras,
          (item1: any) => item1.attachment.id === formData.cover.id,
        );

        attachmentExtras.push({
          attachment: extra.attachment.id,
          thumbnail: extra.thumbnail.id,
        });
      } else {
        coverId = (await uploadFiles(formData.cover.uri)).id;

        if (isVideo(formData.cover.fileType)) {
          const thumbnailId = (await uploadFiles(formData.cover.thumbnail)).id;
          attachmentExtras.push({
            attachment: coverId,
            thumbnail: thumbnailId,
          });
        }
      }
    }

    const uploadUris: any = [];
    _.forEach(formData.images, (item: any) => {
      if (!item.id) {
        uploadUris.push(item.uri);
        if (isVideo(item.fileType)) {
          uploadUris.push(item.thumbnail);
        }
      }
    });

    _.forEach(formData.recordings, (item: any) => {
      if (!item.id) {
        uploadUris.push(item.uri);
      }
    });

    const uploadRes = await uploadFiles(uploadUris);

    const attachments = _.map([...formData.images, ...formData.recordings], (item: any) =>
      item.id ? item.id : _.find(uploadRes, ['uri', item.uri]).id,
    );

    _.forEach(formData.images, (item: any) => {
      if (isVideo(item.fileType)) {
        if (item.id) {
          const extra = _.find(
            formData.attachmentExtras,
            (item1: any) => item1.attachment.id === item.id,
          );

          attachmentExtras.push({
            attachment: extra.attachment.id,
            thumbnail: extra.thumbnail.id,
          });
        } else {
          const extra = {
            attachment: _.find(uploadRes, ['uri', item.uri]).id,
            thumbnail: _.find(uploadRes, ['uri', item.thumbnail]).id,
          };
          attachmentExtras.push(extra);
        }
      }
    });

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
      attachments,
      attachmentExtras,
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
