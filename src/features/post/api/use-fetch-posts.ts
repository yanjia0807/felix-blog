import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/api';

export const useFetchPosts = () =>
  useInfiniteQuery({
    queryKey: ['posts', 'list'],
    queryFn: fetchPosts,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
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
        };
      }

      return null;
    },
  });
