import { useQuery } from '@tanstack/react-query';
import { fetchPost } from '@/api';

export const useFetchPost = ({ documentId }) =>
  useQuery({
    queryKey: ['posts', 'detail', documentId],
    queryFn: () => fetchPost({ documentId }),
  });
