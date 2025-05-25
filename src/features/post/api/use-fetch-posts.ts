import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/api';

export const useFetchPosts = (options?) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'list', options],
    queryFn: fetchPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      ...options,
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          pagination: { page: page + 1, pageSize },
          ...options,
        };
      }

      return null;
    },
  });
};
