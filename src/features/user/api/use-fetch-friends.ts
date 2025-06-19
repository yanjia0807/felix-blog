import { fetchFriends } from '@/api';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

export const useFetchFriends = ({ filters }) =>
  useInfiniteQuery({
    queryKey: ['friends', 'list', filters],
    queryFn: fetchFriends,
    placeholderData: keepPreviousData,
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
