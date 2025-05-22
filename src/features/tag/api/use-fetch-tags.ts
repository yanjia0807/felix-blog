import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPopularPageTags } from '@/api';

export const useFetchTags = () =>
  useInfiniteQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchPopularPageTags,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
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
