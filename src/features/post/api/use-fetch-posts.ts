import { fetchPosts } from '@/api';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

export const useFetchPosts = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'list', params],
    queryFn: fetchPosts,
    placeholderData: keepPreviousData,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      params,
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
          params,
        };
      }

      return null;
    },
  });
};
