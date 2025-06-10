import { fetchExplorePosts } from '@/api';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useFilters } from '../store/use-post-explore-store';

export const useFetchExplorePosts = ({ segments }) => {
  const filters = useFilters({ segments });

  return useInfiniteQuery({
    queryKey: ['posts', 'list', filters],
    queryFn: fetchExplorePosts,
    placeholderData: keepPreviousData,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
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
};
