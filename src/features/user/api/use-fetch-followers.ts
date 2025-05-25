import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFollowers } from '@/api';

export const useFetchFollowers = ({ filters }) =>
  useInfiniteQuery({
    queryKey: ['followers', 'list', filters],
    queryFn: fetchFollowers,
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
