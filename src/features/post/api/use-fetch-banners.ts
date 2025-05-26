import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchBanners } from '@/api';

export const useFetchBanners = () =>
  useInfiniteQuery({
    queryKey: ['posts', 'list', 'banners'],
    queryFn: fetchBanners,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 5,
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
        };
      }

      return null;
    },
  });
