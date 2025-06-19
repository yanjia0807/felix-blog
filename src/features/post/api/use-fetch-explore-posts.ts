import { fetchExplorePosts } from '@/api';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useFilters } from '../store/use-post-explore-store';

export const useFetchExplorePosts = ({ segments }) => {
  const params = useFilters({ segments });

  return useInfiniteQuery({
    queryKey: ['posts', 'list', params],
    queryFn: fetchExplorePosts,
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
