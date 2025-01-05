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
  const { district, avatar, ...rest } = data;
  let newDistrictId = null,
    newAvatarId = null;
  const { district: oldDistrict, avatar: oldAvatar } = user;
  const dataFields = [
    'provinceCode',
    'provinceName',
    'cityCode',
    'cityName',
    'districtCode',
    'districtName',
  ];
  if (district) {
    if (oldDistrict) {
      if (!_.isEqual(_.pick(oldDistrict, dataFields), _.pick(district, dataFields))) {
        await apiClient.put(`/districts/${district.documentId}`, {
          data: _.pick(district, dataFields),
        });
      }
      newDistrictId = district.id;
    } else {
      const res = await apiClient.post(`/districts`, {
        data: _.pick(district, dataFields),
      });
      newDistrictId = res.data.id;
    }
  } else {
    if (oldDistrict) {
      await apiClient.delete(`/districts/${oldDistrict.documentId}`);
      newDistrictId = null;
    }
  }

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

  const res = await apiClient.put(`/users/${user.id}`, {
    ...rest,
    district: newDistrictId,
    avatar: newAvatarId,
  });

  return res;
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
