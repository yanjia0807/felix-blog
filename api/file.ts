import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { apiServerURL } from './api-client';
import { apiClient } from './api-client';

export const uploadFiles = async (files: any) => {
  const config: any = {
    headers: {},
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'files',
  };

  const accessToken = await SecureStore.getItemAsync('accessToken');
  if (accessToken) {
    config.headers.Authorization = 'Bearer ' + accessToken;
  } else {
    delete config.headers.Authorization;
  }

  const uploadFiles = typeof files === 'string' ? [files] : files;
  const uploadTasks: Promise<any>[] = [];

  uploadFiles.forEach((file: any) => {
    const uploadTask = FileSystem.uploadAsync(`${apiServerURL}/api/upload`, file, config);
    uploadTasks.push(uploadTask);
  });

  const res = await Promise.all(uploadTasks);

  const result = res.map((item) => JSON.parse(item.body)[0]);

  if (typeof files === 'string') return result[0];
  return result;
};

export const updateFileInfo = async (id:string, fileInfo:any) => {
  const res = await apiClient.post(`/upload?id=${id}`, {
    data: fileInfo
  });
  return res;
};

export const destoryFile = async (id: string) => {
  const res = await apiClient.delete(`/upload/files/${id}`);
  return res;
};
