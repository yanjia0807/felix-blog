import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchOnlineUsers } from '@/api';

export const useFetchOnlineUsers = ({ userDocumentId }) =>
  useInfiniteQuery({
    queryKey: ['users', 'list', 'online'],
    queryFn: fetchOnlineUsers,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 25,
      },
      userDocumentId,
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
          userDocumentId,
        };
      }

      return null;
    },
  });
