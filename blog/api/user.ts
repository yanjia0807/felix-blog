import _ from 'lodash';
import qs from 'qs';
import { apiClient } from './api-client';
import { destoryFile, uploadFiles } from './file';

export type UserData = any;

export const fetchMe = async () => {
  try {
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

export const updateUser = async ({ user, data }: any) => {
  const { avatar, ...rest } = data;
  let newAvatarId = null;
  const { avatar: oldAvatar } = user;

  if (avatar) {
    const avatarUri = avatar && (avatar.uri || avatar[0]?.uri);
    if (avatarUri) {
      newAvatarId = await uploadFiles(avatarUri);
      if (oldAvatar) {
        try {
          await destoryFile(oldAvatar.id);
        } catch (error) {
          console.warn(error);
        }
      }
    } else {
      newAvatarId = avatar.id;
    }
  } else {
    newAvatarId = null;
    if (oldAvatar) {
      await destoryFile(oldAvatar.id);
    }
  }
  debugger;
  const res = await apiClient.put(`/users/${user.id}`, {
    ...rest,
    avatar: newAvatarId,
  });

  return res;
};

export const fetchUser = async (documentId: string): Promise<any> => {
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

    const res = await apiClient.get(`/users/${documentId}?${query}`);
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const fetchUsers = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;
  const query = qs.stringify({
    populate: {
      avatar: {
        fields: ['formats', 'name', 'alternativeText'],
      },
      followers: {
        populate: ['follower'],
      },
      followings: {
        populate: ['following'],
      },
    },
    pagination,
    filters,
  });
  const res = await apiClient.get(`/users?${query}`);
  return res;
};
