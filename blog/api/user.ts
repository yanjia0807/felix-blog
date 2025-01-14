import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';
import { uploadFiles } from './file';

export type UserData = any;

export const fetchMe = async () => {
  try {
    const query = qs.stringify(
      {
        populate: {
          avatar: {
            fields: ['formats', 'name', 'alternativeText'],
          },
          district: true,
          followers: {
            count: true,
          },
          followings: {
            count: true,
          },
          posts: {
            count: true,
          },
        },
      },
      {
        encodeValuesOnly: true,
      },
    );
    const user: any = await apiClient.get(`/users/me?${query}`);

    return user;
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      throw new Error('缺失或无效的凭据，请重新登录');
    } else if (error.name === 'ForbiddenError') {
      throw new Error('账号被禁用');
    }
  }
};

export const updateMe = async (formData: any) => {
  const query = qs.stringify(
    {
      populate: {
        followers: {
          populate: ['follower'],
          fields: ['id'],
        },
        followings: {
          populate: ['following'],
          fields: ['id'],
        },
        avatar: {
          fields: ['formats', 'name', 'alternativeText'],
        },
        posts: {
          count: true,
        },
        district: true,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

  const data: any = {
    bio: formData.bio,
    birthday: formData.birthday,
    gender: formData.gender,
    phoneNumber: formData.phoneNumber,
    district: formData.district,
  };

  if (formData.avatar) {
    if (!formData.avatar.documentId) {
      const uri = formData.avatar.uri || formData.avatar[0]?.uri;
      data.avatar = await uploadFiles(uri);
    }
  } else {
    data.avatar = null;
  }

  const res = await apiClient.put(`/users/custom/me?${query}`, data);
  return res;
};

export const fetchUser = async (id: string): Promise<any> => {
  try {
    const query = qs.stringify({
      populate: {
        avatar: {
          fields: ['formats', 'name', 'alternativeText'],
        },
        followers: {
          count: true,
        },
        followings: {
          count: true,
        },
        posts: {
          count: true,
        },
      },
    });

    const res = await apiClient.get(`/users/custom/${id}?${query}`);
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const fetchUsers = async ({ pageParam }: any) => {
  const { pagination, keyword, documentId } = pageParam;
  const filters = {
    $and: [
      {
        documentId: {
          $ne: documentId,
        },
      },
      {
        blocked: false,
      },
      {
        confirmed: true,
      },
      keyword
        ? {
            $or: [
              {
                username: {
                  $containsi: keyword,
                },
              },
              {
                email: {
                  $containsi: keyword,
                },
              },
            ],
          }
        : {},
    ],
  };
  const query = qs.stringify({
    populate: {
      avatar: {
        fields: ['formats', 'name', 'alternativeText'],
      },
    },
    filters,
    pagination,
  });
  const res = await apiClient.get(`/users/custom?${query}`);
  return res;
};

export const fetchFollowingUsers = async ({ pageParam }: any) => {
  const { pagination, documentId, keyword } = pageParam;
  const filters = {
    $and: [
      {
        follower: {
          documentId,
        },
      },
      keyword
        ? {
            follower: {
              $or: [
                {
                  username: {
                    $containsi: keyword,
                  },
                },
                {
                  email: {
                    $containsi: keyword,
                  },
                },
              ],
            },
          }
        : {},
    ],
  };

  const populate = {
    following: {
      populate: {
        avatar: {
          fields: ['formats', 'name', 'alternativeText'],
        },
      },
    },
  };

  const query = qs.stringify({
    populate,
    filters,
    pagination,
  });
  const res = await apiClient.get(`/follows?${query}`);

  return res;
};

export const fetchFollowerUsers = async ({ pageParam }: any) => {
  const { pagination, documentId, keyword } = pageParam;
  const filters = {
    $and: [
      {
        following: {
          documentId,
        },
      },
      keyword
        ? {
            follower: {
              $or: [
                {
                  username: {
                    $containsi: keyword,
                  },
                },
                {
                  email: {
                    $containsi: keyword,
                  },
                },
              ],
            },
          }
        : {},
    ],
  };

  const populate = {
    follower: {
      populate: {
        avatar: {
          fields: ['formats', 'name', 'alternativeText'],
        },
      },
    },
  };

  const query = qs.stringify({
    populate,
    filters,
    pagination,
  });
  const res = await apiClient.get(`/follows?${query}`);
  return res;
};
