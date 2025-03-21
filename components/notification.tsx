import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Bell } from 'lucide-react-native';
import { fetchNotificationUnreadCount } from '@/api';
import { useAuth } from './auth-context';
import { useSocket } from './socket-context';
import { Box } from './ui/box';
import { Button, ButtonIcon } from './ui/button';
import { Text } from './ui/text';

const Notification = () => {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const router = useRouter();

  const { data, isSuccess } = useQuery({
    queryKey: ['user', 'detail', user.documentId, 'notifications', 'count'],
    queryFn: () => fetchNotificationUnreadCount(),
    staleTime: Infinity,
    enabled: !!user,
  });

  const count = isSuccess ? (data as any) + _.filter(notifications, { state: 'unread' }).length : 0;
  return (
    <>
      {user && (
        <Button
          onPress={() => router.navigate('/notification-list')}
          action="positive"
          variant="link">
          {count > 0 && (
            <Box className="hs-4 absolute right-0 top-[-8] w-4 items-center justify-center self-end rounded-full bg-error-600 p-[0.5]">
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-[8px] leading-none text-white">
                {count}
              </Text>
            </Box>
          )}
          <ButtonIcon as={Bell} size={22 as any} className="text-secondary-900" />
        </Button>
      )}
    </>
  );
};

export default Notification;
