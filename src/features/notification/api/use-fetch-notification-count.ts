import { fetchNotificationCount } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useFetchNotificationCount = ({ enabled }) =>
  useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => fetchNotificationCount(),
    enabled,
  });
