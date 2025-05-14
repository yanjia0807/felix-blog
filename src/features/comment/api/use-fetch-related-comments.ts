import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { fetchRelatedComments } from '@/api';

export const createRelatedCommentsQuery = ({ postDocumentId, commentDocumentId, enabled }) => {
  return {
    queryKey: ['comments', 'list', postDocumentId, commentDocumentId],
    queryFn: fetchRelatedComments,
    enabled,
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
  };
};

export const queryRelatedComments = async ({
  expandedCommentDocumentIds,
  postDocumentId,
  queryClient,
}) => {
  const quries = _.map(expandedCommentDocumentIds, async (commentDocumentId: string) => {
    const query = createRelatedCommentsQuery({ postDocumentId, commentDocumentId, enabled: true });
    const result =
      queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchInfiniteQuery(query));
    const data = _.flatMap(result.pages, (page) => page.data);
    return {
      commentDocumentId,
      data,
    };
  });

  return await Promise.all(quries);
};

export const useFetchRelatedComments = ({ postDocumentId, commentDocumentId, enabled }) =>
  useInfiniteQuery<any>(createRelatedCommentsQuery({ postDocumentId, commentDocumentId, enabled }));
