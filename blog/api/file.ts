import * as FileSystem from 'expo-file-system';
import { apiServerURL } from './api-client';
import { apiClient } from './api-client';

export const uploadFiles = async (files: any) => {
  const uploadFiles = typeof files === 'string' ? [files] : files;
  const uploadTasks: Promise<any>[] = [];

  uploadFiles.forEach((file: any) => {
    const uploadTask = FileSystem.uploadAsync(`${apiServerURL}/api/upload`, file, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'files',
    });
    uploadTasks.push(uploadTask);
  });

  const res = await Promise.all(uploadTasks);

  const result = res.map((item) => {
    const body = JSON.parse(item.body);
    return body[0].id;
  });

  if (typeof files === 'string') return result[0];
  return result;
};

export const destoryFile = async (id: any) => {
  const res = await apiClient.delete(`/upload/files/${id}`);
  return res;
};
