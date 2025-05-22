import { useQuery } from '@tanstack/react-query';
import { fetchNotificationCount } from '@/api';

export const useFetchNotificationCount = ({ enabled }) =>
  useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => fetchNotificationCount(),
    enabled,
  });
