import { fetchPost } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useFetchPost = ({ documentId }) => {
  return useQuery({
    queryKey: ['posts', 'detail', { documentId }],
    queryFn: () => fetchPost({ documentId }),
  });
};
