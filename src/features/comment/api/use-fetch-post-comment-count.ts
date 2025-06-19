import { fetchPostCommentCount } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useFetchPostCommentCount = (params) =>
  useQuery<any>({
    queryKey: ['comments', 'count', params],
    enabled: !!params.postDocumentId,
    queryFn: () => fetchPostCommentCount(params),
  });
