import _ from 'lodash';
import { createThumbnail } from 'react-native-create-thumbnail';

const apiServerURL = process.env.EXPO_PUBLIC_API_SERVER;

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
      for (const item of specs.slice().reverse()) {
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

export const voiceSecs = (file: any, attachmentExtras: any = []) => {
  const item = _.find(attachmentExtras, (item: any) => item.attachment.id === file.id);
  if (!item) return undefined;
  return item.secs;
};

export const createVideoThumbnail = async (url: string) => {
  try {
    const thumbnail = await createThumbnail({
      url,
      timeStamp: 10000,
    });
    return thumbnail;
  } catch (error) {
    console.error(error);
  }
};

export const toAttachmetItem = (attachment, attachmentExtras) => {
  return _.startsWith(attachment.mime, 'image')
    ? {
        ...attachment,
        uri: fileFullUrl(attachment),
        thumbnail: imageFormat(attachment, 's', 's')?.fullUrl,
        preview: imageFormat(attachment, 'l')?.fullUrl,
      }
    : {
        ...attachment,
        uri: fileFullUrl(attachment),
        thumbnail: videoThumbnailUrl(attachment, attachmentExtras),
        preview: fileFullUrl(attachment),
      };
};

export const isLocalFile = (url) => {
  return _.startsWith(url, 'file://') || _.startsWith(url, '/') || /^[a-zA-Z]:\\/.test(url);
};

export const getFilename = (uri) => {
  if (!uri || typeof uri !== 'string') return '';
  const pathParts = _.split(uri, '/');
  const fileName = _.last(_.filter(pathParts, (part) => !_.isEmpty(part))) || '';
  const nameParts = _.split(fileName, '.');
  return nameParts.length > 1 ? _.initial(nameParts).join('.') : fileName;
};
