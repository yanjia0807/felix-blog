import { fetchChats } from '@/api';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

export const useFetchChats = ({ userDocumentId }) =>
  useInfiniteQuery({
    queryKey: ['chats', 'list'],
    queryFn: fetchChats,
    placeholderData: keepPreviousData,
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
