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
            fields: ['id', 'documentId'],
          },
          followings: {
            fields: ['id', 'documentId'],
          },
          friends: {
            fields: ['id', 'documentId'],
          },
          chats: {
            fields: ['id', 'documentId'],
          },
          posts: {
            fields: ['id', 'documentId'],
          },
          likePosts: {
            fields: ['id', 'documentId'],
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

export const updateMe = async (params: any) => {
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

  const data: any = {
    bio: params.bio,
    birthday: params.birthday,
    gender: params.gender,
    phoneNumber: params.phoneNumber,
    district: params.district,
  };
  if (params.avatar) {
    if (!params.avatar.id) {
      const uri = params.avatar.uri;
      const fileId = await uploadFiles(uri);
      data.avatar = fileId;
    }
  } else {
    data.avatar = null;
  }

  const res = await apiClient.put(`/users/custom/me?${query}`, data);
  return res;
};

export const updateFollowings = async (params: any) => {
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

  const data: any = {
    following: params.following,
  };

  const res = await apiClient.put(`/users/custom/followings?${query}`, data);
  return res.data;
};

export const fetchUser = async (id: string): Promise<any> => {
  const query = qs.stringify({
    populate: {
      avatar: {
        fields: ['formats', 'name', 'alternativeText'],
      },
      followers: {
        fields: ['id', 'documentId'],
      },
      followings: {
        fields: ['id', 'documentId'],
      },
      friends: {
        fields: ['id', 'documentId'],
      },
      posts: {
        fields: ['id', 'documentId'],
      },
      chats: {
        fields: ['id', 'documentId'],
      },
    },
  });

  const res = await apiClient.get(`/users/custom/${id}?${query}`);
  return res;
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

export const fetchOnlineUsers = async ({ pageParam }: any) => {
  const { pagination, userDocumentId } = pageParam;

  const query = qs.stringify({
    populate: {
      avatar: {
        fields: ['alternativeText', 'width', 'height', 'formats'],
      },
    },
    filters: {
      isOnline: true,
      documentId: {
        $notIn: [userDocumentId],
      },
    },
    pagination,
  });

  const res = await apiClient.get(`/users/custom?${query}`);
  return res;
};

export const fetchFollowings = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;

  const populate = {
    avatar: {
      fields: ['alternativeText', 'width', 'height', 'formats'],
    },
  };

  const query = qs.stringify({
    populate,
    pagination,
    filters,
  });

  const res = await apiClient.get(`/users/custom/followings?${query}`);
  return res;
};

export const fetchFollowers = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;

  const populate = {
    avatar: {
      fields: ['alternativeText', 'width', 'height', 'formats'],
    },
  };

  const query = qs.stringify({
    populate,
    pagination,
    filters,
  });

  const res = await apiClient.get(`/users/custom/followers?${query}`);
  return res;
};

export const fetchFriends = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;

  const populate = {
    avatar: {
      fields: ['alternativeText', 'width', 'height', 'formats'],
    },
  };

  const query = qs.stringify({
    populate,
    pagination,
    filters,
  });

  const res = await apiClient.get(`/users/custom/friends?${query}`);
  return res;
};

export const cancelFriend = async (params: any) => {
  const res = await apiClient.put(`/users/custom/cancel-friend`, {
    data: params,
  });
  return res.data;
};
