import { useMutation, useQuery } from '@tanstack/react-query';
import { apiAxios } from './config';
import qs from 'qs';

export type Profile = any;

export const fetchMe = async () => {
  try {
    console.log(`fetchMe`);
    const user: any = await apiAxios.get(`/users/me`);
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
    const res = await apiAxios.get(`/profiles?${query}`);
    const profile = res.data[0];
    const result = {
      ...user,
      profile,
    };
    console.log(`fetchMe`, result);
    return result;
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      throw new Error('缺失或无效的凭据，请重新登录');
    } else if (error.name === 'ForbiddenError') {
      throw new Error('账号被禁用');
    }
  }
};

export const useFetchUser = (tokenExists: boolean) => {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchMe,
    enabled: tokenExists,
  });
};

export const updateUser = async ({
  documentId,
  profile,
}: {
  documentId: string;
  profile: Profile;
}) => {
  try {
    if (documentId) {
      console.log('updateUser', documentId, profile);
      const res = await apiAxios.put(`/profiles/${documentId}`, {
        data: profile,
      });
      return res;
    } else {
      console.log('createProfile', profile);
      const res = await apiAxios.post(`/profiles`, {
        data: profile,
      });
      return res;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: ({ documentId, profile }: { documentId: string; profile: Profile }) => {
      return updateUser({ documentId, profile });
    },
  });
};
