import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { fetchNotifications } from '@/api';

export const useFetchNotifications = ({ userDocumentId }) =>
  useInfiniteQuery({
    queryKey: ['notifications', 'list'],
    queryFn: fetchNotifications,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
      },
      userDocumentId,
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
          userDocumentId,
        };
      }

      return null;
    },
  });
