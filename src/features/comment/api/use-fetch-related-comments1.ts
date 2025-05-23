import { useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import { fetchRelatedComments } from '@/api';
import { useAppSelector } from '@/store/hook';
import { selectExpandedCommentDocumentIds } from '../store';

export const useFetchRelatedComments = ({ postDocumentId }) => {
  const queryClient = useQueryClient();
  const expandedCommentDocumentIds = useAppSelector((state) =>
    selectExpandedCommentDocumentIds(state, { postDocumentId }),
  );

  return Promise.all(
    _.map(expandedCommentDocumentIds, async (commentDocumentId: string) => {
      const query = {
        queryKey: ['comments', 'list', postDocumentId, commentDocumentId],
        queryFn: fetchRelatedComments,
        initialPageParam: {
          topDocumentId: commentDocumentId,
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
              topDocumentId: commentDocumentId,
              pagination: { page: page + 1, pageSize },
            };
          }

          return null;
        },
      };

      return (
        queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchInfiniteQuery(query))
      );
    }),
  );
};
