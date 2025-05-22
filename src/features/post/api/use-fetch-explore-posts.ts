import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { fetchExplorePosts } from '@/api';

export const useFetchExplorePosts = ({ filterType, filters }: any) =>
  useInfiniteQuery({
    queryKey: ['posts', 'list', { filterType, filters }],
    queryFn: fetchExplorePosts,
    placeholderData: keepPreviousData,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      filterType,
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
          filterType,
          filters,
        };
      }

      return null;
    },
  });
