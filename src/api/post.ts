import { endOfDay, startOfDay } from 'date-fns';
import _ from 'lodash';
import qs from 'qs';
import { apiClient } from '../utils/api-client';
import { uploadFiles } from './file';

export const fetchPosts = async ({ pageParam }: any) => {
  const { params, pagination } = pageParam;

  const filters: any = {
    $and: [],
  };

  const commentFilters: any = {
    $and: [],
  };

  if (!_.isNil(params.isPublished)) {
    filters['$and'].push({
      isPublished: params.isPublished,
    });
  }

  if (params.author) {
    filters['$and'].push({
      author: {
        documentId: params.author,
      },
    });
  }

  if (params.blockUsers) {
    filters['$and'].push({
      author: {
        documentId: {
          $notIn: params.blockUsers,
        },
      },
    });

    commentFilters['$and'].push({
      user: {
        documentId: {
          $notIn: params.blockUsers,
        },
      },
    });
  }

  const populate = {
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
      filters: commentFilters,
      count: true,
    },
  };

  const query = qs.stringify(
    {
      populate,
      filters,
      pagination: pagination,
      sort: 'publishDate:desc',
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchPostOutlines = async ({ pageParam }: any) => {
  const {
    pagination,
    filters: { title, authorName, publishDateFrom, publishDateTo, tags },
  } = pageParam;

  const filters: any = {
    $and: [
      {
        isPublished: true,
      },
    ],
  };

  if (!_.isNil(title) && !_.isEmpty(title)) {
    filters['$and'].push({
      title: {
        $containsi: title,
      },
    });
  }

  if (!_.isNil(authorName) && !_.isEmpty(authorName)) {
    filters['$and'].push({
      author: {
        username: {
          $containsi: authorName,
        },
      },
    });
  }

  if (!_.isNil(publishDateFrom)) {
    filters['$and'].push({
      publishDate: {
        $gte: startOfDay(publishDateFrom),
      },
    });
  }

  if (!_.isNil(publishDateTo)) {
    filters['$and'].push({
      publishDate: {
        $lt: endOfDay(publishDateTo),
      },
    });
  }

  if (!_.isNil(tags) && !_.isEmpty(tags)) {
    filters['$and'].push({
      tags: {
        $in: tags,
      },
    });
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
      },
      filters,
      sort: 'publishDate:desc',
      pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchTrendingPosts = async ({ pageParam }: any) => {
  const query = qs.stringify(
    {
      pagination: pageParam.pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/posts/trending?${query}`);
  return res;
};

export const fetchFollowingPosts = async ({ pageParam }: any) => {
  const { params, pagination } = pageParam;

  if (params.followings.length === 0) {
    return {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: pagination.pageSize,
          pageCount: 0,
          total: 0,
        },
      },
    };
  }

  const filters: any = {
    $and: [
      {
        isPublished: true,
      },
      {
        author: {
          documentId: {
            $in: params.followings,
          },
        },
      },
      {
        author: {
          documentId: {
            $notIn: params.blockUsers,
          },
        },
      },
    ],
  };

  const populate = {
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
    cover: true,
    attachments: true,
    attachmentExtras: {
      populate: {
        attachment: true,
        thumbnail: true,
      },
    },
  };

  const query = qs.stringify(
    {
      populate,
      filters,
      pagination: pagination,
      sort: 'publishDate:desc',
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchDiscoverPosts = async ({ pageParam }: any) => {
  const { params, pagination } = pageParam;

  const filters: any = {
    $and: [
      {
        isPublished: true,
      },
      {
        author: {
          documentId: {
            $notIn: params.blockUsers,
          },
        },
      },
    ],
  };

  if (!_.isNil(params.tags) && params.tags.length > 0) {
    filters['$and'].push({
      tags: {
        $in: params.tags,
      },
    });
  }

  const populate = {
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
    cover: true,
    attachments: true,
    attachmentExtras: {
      populate: {
        attachment: true,
        thumbnail: true,
      },
    },
  };

  const query = qs.stringify(
    {
      filters,
      populate,
      pagination: pagination,
      sort: 'publishDate:desc',
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/posts?${query}`);
  return res;
};

export const fetchExplorePosts = async ({ pageParam }: any) => {
  switch (pageParam.params.filterType) {
    case 'trending':
      return fetchTrendingPosts({ pageParam });
    case 'following':
      return fetchFollowingPosts({ pageParam });
    case 'discover':
      return fetchDiscoverPosts({ pageParam });
    default:
      break;
  }
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

export const fetchPost = async ({ documentId }: any) => {
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
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await apiClient.get(`/posts/${documentId}?${query}`);
  return res.data;
};

export const createPost = async (formData: any) => {
  let coverId = null;
  const attachmentExtras: any = [];

  if (formData.cover) {
    coverId = (await uploadFiles(formData.cover.uri)).id;

    if (_.startsWith(formData.cover.mime, 'video')) {
      const thumbnailId = (await uploadFiles(formData.cover.thumbnail)).id;
      attachmentExtras.push({
        attachment: coverId,
        thumbnail: thumbnailId,
      });
    }
  }

  const uploadUris: any = [];
  _.forEach(formData.imageries, (item: any) => {
    uploadUris.push(item.uri);
    if (_.startsWith(item.mime, 'video')) {
      uploadUris.push(item.thumbnail);
    }
  });

  const uploadRes = await uploadFiles(uploadUris);
  const attachments = _.map(
    formData.imageries,
    (item: any) => _.find(uploadRes, ['uri', item.uri]).id,
  );

  _.forEach(formData.imageries, (item: any) => {
    if (_.startsWith(item.mime, 'video')) {
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
    isPublished: formData.isPublished,
  };

  const res = await apiClient.post(`/posts`, { data });

  return res.data;
};

export const editPost = async (formData: any) => {
  let coverId = null;
  const attachmentExtras: any = [];

  if (formData.cover.id) {
    coverId = formData.cover.id;

    if (_.startsWith(formData.cover.mime, 'video')) {
      const extra = _.find(
        formData.attachmentExtras,
        (item1: any) => item1.attachment.id === formData.cover.id,
      );

      attachmentExtras.push({
        attachment: extra.attachment.id,
        thumbnail: extra.thumbnail.id,
      });
    }
  } else {
    coverId = (await uploadFiles(formData.cover.uri)).id;

    if (_.startsWith(formData.cover.mime, 'video')) {
      const thumbnailId = (await uploadFiles(formData.cover.thumbnail)).id;
      attachmentExtras.push({
        attachment: coverId,
        thumbnail: thumbnailId,
      });
    }
  }

  const uploadUris: any = [];
  _.forEach(formData.imageries, (item: any) => {
    if (!item.id) {
      uploadUris.push(item.uri);
      if (_.startsWith(item.mime, 'video')) {
        uploadUris.push(item.thumbnail);
      }
    }
  });

  const uploadRes = await uploadFiles(uploadUris);

  const attachments = _.map(formData.imageries, (item: any) =>
    item.id ? item.id : _.find(uploadRes, ['uri', item.uri]).id,
  );

  _.forEach(formData.imageries, (item: any) => {
    if (_.startsWith(item.mime, 'video')) {
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
    author: formData.author.documentId,
    poi,
    tags,
    attachments,
    attachmentExtras,
    isPublished: formData.isPublished,
  };

  const res = await apiClient.put(`/posts/${formData.documentId}`, {
    data,
  });

  return res.data;
};

export const deletePost = async ({ documentId }: any) => {
  const res = await apiClient.delete(`/posts/${documentId}`);

  return res;
};

export const editPublish = async ({ documentId, isPublished }: any) => {
  const res = await apiClient.put(`/posts/${documentId}`, {
    data: {
      isPublished,
    },
  });

  return res;
};

export const updatePostLiked = async ({ documentId, postData }: any) => {
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
};
