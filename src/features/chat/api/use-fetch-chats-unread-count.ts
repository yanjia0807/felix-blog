import { fetchChatsUnreadCount } from '@/api';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useQuery } from '@tanstack/react-query';

export const useFetchChatsUnreadCount = () => {
  const { user } = useAuth();

  const queryChatsUnreadCount = async () => {
    if (!user) return null;
    return fetchChatsUnreadCount();
  };

  return useQuery({
    queryKey: ['chats', 'unread-count'],
    queryFn: queryChatsUnreadCount,
  });
};
