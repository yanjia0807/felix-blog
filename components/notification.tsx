import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Bell } from 'lucide-react-native';
import { fetchNotificationUnreadCount } from '@/api';
import { useAuth } from './auth-context';
import { useSocket } from './socket-context';
import { Box } from './ui/box';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';

const Notification = () => {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const router = useRouter();

  const { data, isSuccess } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => fetchNotificationUnreadCount(),
    staleTime: Infinity,
    enabled: !!user,
  });

  const count = isSuccess ? (data as any) + _.filter(notifications, { state: 'unread' }).length : 0;
  return (
    <>
      {user && (
        <Pressable onPress={() => router.navigate('/notification-list')}>
          {count > 0 && (
            <Box className="absolute right-0 top-[-8] h-4 w-4 items-center justify-center self-end rounded-full bg-error-600 p-[0.5]">
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-[8px] leading-none text-white">
                {count}
              </Text>
            </Box>
          )}
          <Icon className="text-tertiary-500" as={Bell} size={22 as any} />
        </Pressable>
      )}
    </>
  );
};

export default Notification;
