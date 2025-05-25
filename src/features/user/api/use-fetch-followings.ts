import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFollowings } from '@/api';

export const useFetchFollowings = ({ filters }) =>
  useInfiniteQuery({
    queryKey: ['followings', 'list', filters],
    queryFn: fetchFollowings,
    enabled: !!filters.userDocumentId,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
      },
      filters,
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
          filters,
        };
      }

      return null;
    },
  });
