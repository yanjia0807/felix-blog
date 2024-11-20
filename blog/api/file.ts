import { baseURL } from './config';
import * as FileSystem from 'expo-file-system';

export const upload = async (files: any) => {
  const uploadTasks: Promise<any>[] = [];

  files.forEach((file: any) => {
    const uploadTask = FileSystem.uploadAsync(`${baseURL}/api/upload`, file, {
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
  return result;
};
