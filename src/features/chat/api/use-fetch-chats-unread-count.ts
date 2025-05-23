import { useQuery } from '@tanstack/react-query';
import { fetchChatsUnreadCount } from '@/api';

export const useFetchChatsUnreadCount = () =>
  useQuery({
    queryKey: ['chats', 'unread-count'],
    queryFn: fetchChatsUnreadCount,
  });
