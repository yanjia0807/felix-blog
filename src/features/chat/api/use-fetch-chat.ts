import { fetchChat } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useFetchChat = ({ documentId, userDocumentId }) =>
  useQuery({
    queryKey: ['chats', 'detail', { documentId, userDocumentId }],
    queryFn: () => fetchChat({ documentId, userDocumentId }),
  });
