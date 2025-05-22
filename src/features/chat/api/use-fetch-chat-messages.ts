import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchChatMessages } from '@/api';

export const useFetchChatMessages = ({ chatDocumentId }) =>
  useInfiniteQuery({
    queryKey: ['messsages', 'list', { chatDocumentId }],
    queryFn: fetchChatMessages,
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
