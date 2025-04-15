import { ImageManipulator } from 'expo-image-manipulator';
import { createVideoPlayer } from 'expo-video';
import _ from 'lodash';

const apiServerURL = process.env.EXPO_PUBLIC_API_SERVER;

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

export const isAudio = (mime: string) => getFileType(mime) === FileTypeNum.Audio;

export const fileFullUrl = (file: any) => {
  if (!file) return undefined;
  return `${apiServerURL}${file.url}`;
};

export const imageFormat = (file: any, type: 's' | 'l' = 's', spec?: 't' | 's' | 'm' | 'l') => {
  if (!file) return undefined;

  const formats = file.formats || {};
  const specs = ['thumbnail', 'small', 'medium', 'large'];
  let selected = undefined;

  if (spec) {
    let format;
    switch (spec) {
      case 't':
        format = 'thumbnail';
        break;
      case 's':
        format = 'small';
        break;
      case 'm':
        format = 'medium';
        break;
      case 'l':
        format = 'large';
        break;
    }
    selected = formats[format];
  }

  if (!selected) {
    if (type === 's') {
      for (const item of specs) {
        if (formats[item]) {
          selected = formats[item];
          break;
        }
      }
    }
    if (type === 'l') {
      for (const item of _.reverse(specs)) {
        if (formats[item]) {
          selected = formats[item];
          break;
        }
      }
    }
  }

  if (selected) {
    selected = { ...selected, fullUrl: `${apiServerURL}${selected.url}` };
  }

  return selected;
};

export const videoThumbnailUrl = (file: any, attachmentExtras: any = []) => {
  const item = _.find(attachmentExtras, (item: any) => item.attachment.id === file.id);
  if (!item) return undefined;
  return `${apiServerURL}${item.thumbnail.formats.thumbnail.url}`;
};

export const createVideoThumbnail = async (url: string) => {
  const player = createVideoPlayer(url);
  const thumbnails = await player.generateThumbnailsAsync(10);
  player.release();

  if (thumbnails.length > 0) {
    const thumbnail = thumbnails[0];
    const image = await (
      await ImageManipulator.manipulate(thumbnail).renderAsync()
    ).saveAsync({
      compress: 1,
    });
    return image;
  }
};
