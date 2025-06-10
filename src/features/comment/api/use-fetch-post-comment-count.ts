import { fetchPostCommentCount } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useFetchPostCommentCount = ({ postDocumentId }) =>
  useQuery<any>({
    queryKey: ['comments', 'count', { postDocumentId }],
    enabled: !!postDocumentId,
    queryFn: () => fetchPostCommentCount({ documentId: postDocumentId }),
  });
