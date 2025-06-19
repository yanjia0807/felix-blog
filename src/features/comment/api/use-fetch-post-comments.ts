import { fetchPostComments } from '@/api';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useFetchPostComments = (params) =>
  useInfiniteQuery<any>({
    queryKey: ['comments', 'list', params],
    queryFn: fetchPostComments,
    enabled: !!params.postDocumentId,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
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
