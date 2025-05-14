import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPostComments } from '@/api';

export const useFetchPostComments = ({ postDocumentId }) =>
  useInfiniteQuery<any>({
    queryKey: ['comments', 'list', postDocumentId],
    queryFn: fetchPostComments,
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
