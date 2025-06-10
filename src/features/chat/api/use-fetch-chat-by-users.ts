import { fetchChatByUsers } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useFetchChatByUsers = ({ enabled, userDocumentIds }) =>
  useQuery({
    queryKey: ['chats', 'detail', { userDocumentIds }],
    queryFn: () => fetchChatByUsers({ userDocumentIds }),
    enabled,
  });
