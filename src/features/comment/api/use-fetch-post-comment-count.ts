import { useQuery } from '@tanstack/react-query';
import { fetchPostCommentCount } from '@/api';

export const useFetchPostCommentCount = ({ postDocumentId }) =>
  useQuery<any>({
    queryKey: ['comments', 'count', postDocumentId],
    enabled: !!postDocumentId,
    queryFn: () => fetchPostCommentCount({ documentId: postDocumentId }),
  });
