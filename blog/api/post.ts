import { apiAxios } from './config';
import qs from 'qs';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type PostData = any;

export const fetchPosts = async ({ pageParam: { pagination } }: any) => {
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
      order: 'id:desc',
      pagination,
    },
    {
      encodeValuesOnly: true,
    },
  );
  const res = await apiAxios.get(`/posts?${query}`);
  return res;
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
  const res = await apiAxios.get(`/posts/${documentId}?${query}`);
  console.log(JSON.stringify(res.data));
  return res.data;
};

export const createPost = async (postData: PostData) => {
  console.log(postData);
  const res = await apiAxios.post(`/posts`, {
    data: postData,
  });

  return res.data;
};

export const useCreatePost = () => {
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
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialPageParam: {
      pagination: {
        start: 0,
        limit: 1,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { limit, start, total },
        },
      } = lastPage;

      if (start + limit >= total) {
        return null;
      }

      return {
        pagination: { limit, start: start + limit },
      };
    },
  });
};
