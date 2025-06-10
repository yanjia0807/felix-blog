import { fetchUser } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useFetchUser = ({ documentId }) => {
  return useQuery({
    queryKey: ['users', 'detail', { documentId }],
    queryFn: () => fetchUser({ documentId }),
  });
};
