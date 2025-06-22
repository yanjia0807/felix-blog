import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import _ from 'lodash';
import { apiClient } from '../utils/api-client';

const apiServerURL = process.env.EXPO_PUBLIC_API_SERVER;

export const uploadFiles = async (files: any) => {
  const config: any = {
    headers: {},
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'files',
  };

  const accessToken = await AsyncStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = 'Bearer ' + accessToken;
  } else {
    delete config.headers.Authorization;
  }

  const uris = typeof files === 'string' ? [files] : files;

  const tasks = _.map(uris, (uri: any) =>
    FileSystem.uploadAsync(`${apiServerURL}/api/upload`, uri, config).then((res: any) => {
      if (res.status === 413) {
        throw new Error('文件超过大小限制');
      }
      const result = { ...JSON.parse(res.body)[0], uri };
      return result;
    }),
  );

  const res: any = await Promise.all(tasks);
  return typeof files === 'string' ? res[0] : res;
};

export const getFile = async (id: string) => {
  const res = await apiClient.get(`/upload/files/${id}`);
  return res;
};

export const updateFileInfo = async (id: string, fileInfo: any) => {
  const res = await apiClient.post(`/upload?id=${id}`, {
    data: fileInfo,
  });
  return res;
};

export const destoryFile = async (id: string) => {
  const res = await apiClient.delete(`/upload/files/${id}`);
  return res;
};
