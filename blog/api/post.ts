import axios from 'axios';
import qs from 'qs';
import { baseURL } from './config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type PostData = any;

export const fetchPosts = async () => {
  const query = qs.stringify(
    {
      populate: {
        tags: true,
        author: {
          populate: {
            profile: {
              populate: ['avatar'],
            },
          },
        },
        cover: {
          fields: ['formats', 'name', 'alternativeText'],
        },
        blocks: {
          on: {
            'shared.attachment': {
              populate: {
                files: true,
              },
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await axios.get(`${baseURL}/api/posts?${query}`);
  return res.data.data;
};

export const fetchPostByDocumentId = async ({ queryKey }: any) => {
  const [_key, documentId] = queryKey;

  const query = qs.stringify(
    {
      populate: {
        tags: true,
        author: {
          populate: {
            profile: {
              populate: ['avatar'],
            },
          },
        },
        blocks: {
          on: {
            'shared.attachment': {
              populate: {
                files: true,
              },
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await axios.get(`${baseURL}/api/posts/${documentId}?${query}`);
  console.log(JSON.stringify(res.data.data));
  return res.data.data;
};

export const createPost = async (postData: PostData) => {
  console.log(postData);
  const res = await axios.post(`${baseURL}/api/posts`, {
    data: postData,
  });

  return res.data.data;
};

export const useCreatePostMutation = () => {
  return useMutation({
    mutationFn: (postData: PostData) => {
      return createPost(postData);
    },
  });
};

export const useFetchPost = (documentId: string) => {
  return useQuery({
    queryKey: ['posts', documentId],
    queryFn: fetchPostByDocumentId,
  });
};

export const useFetchPosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });
};
