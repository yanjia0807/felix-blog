import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchChats } from '@/api';

export const useFetchChats = ({ userDocumentId }) =>
  useInfiniteQuery({
    queryKey: ['chats', 'list'],
    queryFn: fetchChats,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
      },
      documentId: userDocumentId,
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          pagination: { page: page + 1, pageSize },
          documentId: userDocumentId,
        };
      }

      return null;
    },
  });
