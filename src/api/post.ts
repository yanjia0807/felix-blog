import { endOfDay, startOfDay } from 'date-fns';
import _ from 'lodash';
import qs from 'qs';
import { isVideo } from '@/utils/file';
import { uploadFiles } from './file';
import { apiClient } from '../utils/api-client';

export const fetchPosts = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;
  const params = {
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
        fields: ['formats', 'name', 'alternativeText'],
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
    filters: {
      isPublished: true,
      ...filters,
    },
    sort: 'publishDate:desc',
    pagination,
  };
  const query = qs.stringify(params, {
    encodeValuesOnly: false,
  });

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

export const fetchPostCommentCount = async ({ documentId }: any) => {
  const query = qs.stringify({
    populate: {
      comments: {
        count: true,
      },
    },
  });
  const res = await apiClient.get(`/posts/${documentId}?${query}`);
  return res.data;
};

export const fetchTrendingPosts = async ({ pageParam }: any) => {
  const { pagination } = pageParam;
  const query = qs.stringify(
    {
      pagination,
    },
    {
      encodeValuesOnly: false,
    },
  );

  const res = await apiClient.get(`/posts/trending?${query}`);
  return res;
};

export const fetchFollowingPosts = async ({ pageParam }: any) => {
  const {
    pagination,
    filters: { followings },
  } = pageParam;

  const filters: any = {
    $and: [
      {
        isPublished: true,
      },
      {
        author: {
          documentId: {
            $in: followings,
          },
        },
      },
    ],
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

export const fetchDiscoverPosts = async ({ pageParam }: any) => {
  const {
    pagination,
    filters: { tags },
  } = pageParam;

  const filters: any = {
    $and: [
      {
        isPublished: true,
      },
    ],
  };

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

export const fetchExplorePosts = async ({ pageParam }: any) => {
  const { filterType } = pageParam;

  if (filterType === 'trending') {
    return fetchTrendingPosts({ pageParam });
  } else if (filterType === 'following') {
    return fetchFollowingPosts({ pageParam });
  } else if (filterType === 'discover') {
    return fetchDiscoverPosts({ pageParam });
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

    if (isVideo(formData.cover.mime)) {
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
    if (isVideo(item.mime)) {
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
    if (isVideo(item.mime)) {
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

  if (formData.cover) {
    if (formData.cover.id) {
      coverId = formData.cover.id;

      if (isVideo(formData.cover.mime)) {
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

      if (isVideo(formData.cover.mime)) {
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
      if (isVideo(item.mime)) {
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
    if (isVideo(item.mime)) {
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
