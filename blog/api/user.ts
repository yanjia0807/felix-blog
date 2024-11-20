import { apiClient } from './config';
import qs from 'qs';

export type UserData = any;

export const fetchUser = async () => {
  try {
    const user: any = await apiClient.get(`/users/me`);
    const query = qs.stringify(
      {
        populate: {
          avatar: {
            fields: ['formats', 'name', 'alternativeText'],
          },
        },
        filters: {
          user: {
            id: {
              $eq: user.id,
            },
          },
        },
      },
      {
        encodeValuesOnly: true,
      },
    );
    const res = await apiClient.get(`/profiles?${query}`);
    const profile = res.data[0];
    const result = {
      ...user,
      profile,
    };
    return result;
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      throw new Error('缺失或无效的凭据，请重新登录');
    } else if (error.name === 'ForbiddenError') {
      throw new Error('账号被禁用');
    }
  }
};

export const updateUser = async ({
  documentId,
  profile,
}: {
  documentId: string;
  profile: UserData;
}) => {
  try {
    if (documentId) {
      const res = await apiClient.put(`/profiles/${documentId}`, {
        data: profile,
      });
      return res;
    } else {
      const res = await apiClient.post(`/profiles`, {
        data: profile,
      });
      return res;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};
