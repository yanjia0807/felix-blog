import qs from 'qs';
import { apiClient } from './api-client';

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

export const updateUser = async ({ id, userData }: { id: string; userData: UserData }) => {
  try {
    const res = await apiClient.put(`/users/${id}`, {
      data: userData,
    });
    return res;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const fetchUser = async (documentId: string): Promise<any> => {
  try {
    const res = await apiClient.get(`/users/${documentId}`);
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
