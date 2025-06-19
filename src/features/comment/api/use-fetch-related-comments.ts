import { fetchRelatedComments } from '@/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useIsCommentExpanded } from '../store';

export const useFetchRelatedComments = (params) => {
  const isCommentExpanded = useIsCommentExpanded(params.commentDocumentId);

  return useInfiniteQuery<any>({
    queryKey: ['comments', 'list', params],
    queryFn: fetchRelatedComments,
    enabled: isCommentExpanded,
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
};
