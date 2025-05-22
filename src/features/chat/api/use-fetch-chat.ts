import { useQuery } from '@tanstack/react-query';
import { fetchChat } from '@/api';

export const useFetchChat = ({ documentId, userDocumentId }) =>
  useQuery({
    queryKey: ['chats', 'detail', documentId],
    queryFn: () => fetchChat({ documentId, userDocumentId }),
  });
