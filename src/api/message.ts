import _ from 'lodash';
import qs from 'qs';
import { apiClient } from '../utils/api-client';
import { uploadFiles } from './file';

export type MessageData = any;

export const fetchChatMessages = async ({ pageParam }: any) => {
  const { pagination, filters } = pageParam;
  const query = qs.stringify({
    populate: {
      sender: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      receiver: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      attachments: true,
      attachmentExtras: {
        populate: {
          attachment: true,
          thumbnail: true,
        },
      },
      messageStatuses: true,
    },
    filters: {
      chat: {
        documentId: filters.chatDocumentId,
      },
      documentId: {
        $notIn: filters.excludeDocumentIds,
      },
    },
    sort: 'createdAt:desc',
    pagination,
  });
  const res = await apiClient.get(`/messages?${query}`);
  return res;
};

export const createMessage = async (formData: any) => {
  let data = {};
  if (formData.messageType === 'text') {
    const { voice, imageries, ...rest } = formData;
    data = rest;
  } else if (formData.messageType === 'voice') {
    const { content, voice, imageries, ...rest } = formData;

    const uploadRes = await uploadFiles(voice.file);
    const attachments = [uploadRes.id];
    const attachmentExtras = [
      {
        attachment: uploadRes.id,
        secs: voice.secs,
      },
    ];

    data = {
      ...rest,
      attachments,
      attachmentExtras,
    };
  } else if (formData.messageType === 'imagery') {
    const { content, voice, imageries, ...rest } = formData;

    const uploadUris: any = [];
    _.forEach(imageries, (item: any) => {
      uploadUris.push(item.uri);
      if (_.startsWith(item.mime, 'video')) uploadUris.push(item.thumbnail);
    });
    const uploadRes = await uploadFiles(uploadUris);
    const attachments = _.map(imageries, (item: any) => _.find(uploadRes, ['uri', item.uri]).id);
    const attachmentExtras = [];
    _.forEach(imageries, (item: any) => {
      if (_.startsWith(item.mime, 'video')) {
        attachmentExtras.push({
          attachment: _.find(uploadRes, ['uri', item.uri]).id,
          thumbnail: _.find(uploadRes, ['uri', item.thumbnail]).id,
        });
      }
    });

    data = {
      ...rest,
      attachments,
      attachmentExtras,
    };
  }

  const query = qs.stringify({
    populate: {
      chat: {
        fields: ['id', 'documentId'],
      },
      sender: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      receiver: {
        populate: {
          avatar: {
            fields: ['alternativeText', 'width', 'height', 'formats'],
          },
        },
      },
      attachments: true,
      attachmentExtras: {
        populate: {
          attachment: true,
          thumbnail: true,
        },
      },
      messageStatuses: true,
    },
  });

  const res = await apiClient.post(`/messages?${query}`, { data });
  return res.data;
};
