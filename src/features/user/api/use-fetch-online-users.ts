import { fetchOnlineUsers } from '@/api';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useFetchOnlineUsers = () =>
  useInfiniteQuery({
    queryKey: ['users', 'list', 'online'],
    queryFn: fetchOnlineUsers,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 25,
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
