import { fetchPostComments } from '@/api';
import { useInfiniteQuery, usePrefetchInfiniteQuery } from '@tanstack/react-query';

export const usePrefetchPostComments = ({ postDocumentId }) =>
  usePrefetchInfiniteQuery({
    queryKey: ['comments', 'list', { postDocumentId }],
    queryFn: fetchPostComments,
    initialPageParam: undefined,
  });

export const useFetchPostComments = ({ postDocumentId }) =>
  useInfiniteQuery<any>({
    queryKey: ['comments', 'list', { postDocumentId }],
    queryFn: fetchPostComments,
    enabled: !!postDocumentId,
    initialPageParam: {
      postDocumentId,
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
          postDocumentId,
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });
