import { fetchRelatedComments } from '@/api';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useIsCommentExpanded } from '../store';

export const useFetchRelatedComments = ({ postDocumentId, commentDocumentId }) => {
  const isCommentExpanded = useIsCommentExpanded(commentDocumentId);

  return useInfiniteQuery<any>({
    queryKey: ['comments', 'list', { postDocumentId, commentDocumentId }],
    queryFn: fetchRelatedComments,
    enabled: isCommentExpanded,
    initialPageParam: {
      topDocumentId: commentDocumentId,
      pagination: {
        page: 1,
        pageSize: 5,
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
          topDocumentId: commentDocumentId,
          pagination: { page: page + 1, pageSize },
        };
      }

      return null;
    },
  });
};
