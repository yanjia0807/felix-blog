import { fetchChatMessages } from '@/api';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

export const useFetchChatMessages = ({ chatDocumentId }) =>
  useInfiniteQuery({
    queryKey: ['messsages', 'list', { chatDocumentId }],
    queryFn: fetchChatMessages,
    placeholderData: keepPreviousData,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      filters: {
        chatDocumentId,
      },
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
          filters: {
            chatDocumentId,
          },
        };
      }

      return null;
    },
  });
