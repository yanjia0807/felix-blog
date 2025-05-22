import { useQuery } from '@tanstack/react-query';
import { fetchChatByUsers } from '@/api';

export const useFetchChatByUsers = ({ enabled, userDocumentIds }) =>
  useQuery({
    queryKey: ['chats', 'detail', { userDocumentIds }],
    queryFn: () => fetchChatByUsers({ userDocumentIds }),
    enabled,
  });
