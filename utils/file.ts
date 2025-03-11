import { ImageManipulator } from 'expo-image-manipulator';
import { createVideoPlayer } from 'expo-video';
import _ from 'lodash';
import { apiServerURL } from '@/api';

export enum FileTypeNum {
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  File = 'file',
}

export type FileType = FileTypeNum | undefined;

export const getFileType = (mime: string): FileType => {
  const sections = _.split(mime, '/');
  let fileType: FileType;

  switch (sections[0]) {
    case 'image':
      fileType = FileTypeNum.Image;
      break;
    case 'video':
      fileType = FileTypeNum.Video;
      break;
    case 'audio':
      fileType = FileTypeNum.Audio;
      break;
    case 'file':
      fileType = FileTypeNum.File;
      break;
    default:
      fileType = undefined;
      break;
  }

  return fileType;
};

export const isImage = (mime: string) => getFileType(mime) === FileTypeNum.Image;

export const isVideo = (mime: string) => getFileType(mime) === FileTypeNum.Video;

export const largeUrl = (file: any) => {
  if (!file) return '';
  const formats = file.formats || {};
  const specs = ['large', 'medium'];
  let selected = file.url;
  for (const item of specs) {
    if (formats[item]) {
      selected = formats[item].url;
      break;
    }
  }
  return `${apiServerURL}${selected}`;
};

export const thumbnailUrl = (file: any) => {
  if (!file) return '';
  const formats = file.formats || {};
  const specs = ['thumbnail', 'small'];
  let selected = file.url;
  for (const item of specs) {
    if (formats[item]) {
      selected = formats[item].url;
      break;
    }
  }
  return `${apiServerURL}${selected}`;
};

export const videoUrl = (file: any) => {
  if (!file) return '';
  let selected = file.url;
  return `${apiServerURL}${selected}`
};

export const getVideoImage = async (url: string) => {
  const player = createVideoPlayer(url);
  const thumbnails = await player.generateThumbnailsAsync(10);
  player.release();

  if (thumbnails.length > 0) {
    const thumbnail = thumbnails[0];
    const image = await (
      await ImageManipulator.manipulate(thumbnail).renderAsync()
    ).saveAsync({
      compress: 0.8,
    });
    return image;
  }
};
