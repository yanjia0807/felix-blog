import { fetchUsers } from '@/api';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useFetchUsers = (params) => {
  const { keywords } = params.filters;

  const filters = {
    $and: [
      {
        blocked: false,
      },
      {
        confirmed: true,
      },
      {
        $or: [
          {
            username: {
              $containsi: keywords,
            },
          },
          {
            email: {
              $containsi: keywords,
            },
          },
        ],
      },
    ],
  };

  return useInfiniteQuery({
    queryKey: ['users', 'list', filters],
    queryFn: fetchUsers,
    enabled: keywords.length > 0,
    initialPageParam: {
      pagination: {
        page: 1,
        pageSize: 20,
      },
      filters,
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
          filters,
        };
      }

      return null;
    },
  });
};
