import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPostOutlines } from '@/api';

export const useFetchPostOutlines = ({ filters, enabled }: any) =>
  useInfiniteQuery({
    queryKey: ['posts', 'list', filters],
    enabled,
    queryFn: fetchPostOutlines,
    initialPageParam: {
      filters,
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
          filters,
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });
