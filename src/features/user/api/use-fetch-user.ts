import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '@/api';

export const useFetchUser = ({ documentId }) => {
  return useQuery({
    queryKey: ['users', 'detail', { documentId }],
    queryFn: () => fetchUser({ documentId }),
  });
};
