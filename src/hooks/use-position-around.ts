import { fetchAround } from '@/api';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

export const useFetchPostionAround = (position) => {
  return useInfiniteQuery({
    queryKey: [
      'location',
      'list',
      {
        location: {
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
        },
      },
    ],
    placeholderData: keepPreviousData,
    queryFn: fetchAround,
    initialPageParam: {
      location: {
        latitude: position?.coords?.latitude,
        longitude: position?.coords?.longitude,
      },
      page_num: 1,
      page_size: 20,
    },
    getNextPageParam: (lastPage: any, pages: any, lastPageParam: any) => {
      if (Number(lastPage.count) < lastPageParam['page_size'] || Number(lastPage.count) === 0) {
        return undefined;
      }
      return {
        location: lastPageParam.location,
        page_num: lastPageParam['page_num'] + 1,
        page_size: lastPageParam['page_size'],
      };
    },
    enabled: !!position,
  });
};
