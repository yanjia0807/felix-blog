import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Bell } from 'lucide-react-native';
import React from 'react';
import { fetchNotificationUnreadCount } from '@/api';
import { useAuth } from './auth-context';
import { useSocket } from './socket-context';
import { Box } from './ui/box';
import { Icon } from './ui/icon';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

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
  // const count = 0;
  return (
    <>
      {user && (
        <Pressable
          className="m-3"
          onPress={() => {
            router.navigate('/notification-list');
          }}>
          <VStack>
            {count > 0 && (
              <Box className="absolute right-[-6] top-[-6] h-4 w-4 items-center justify-center self-end rounded-full bg-error-600 p-[0.5]">
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="text-[8px] leading-none text-white">
                  {count}
                </Text>
              </Box>
            )}
            <Icon as={Bell} size="xl" className="text-typography-900" />
          </VStack>
        </Pressable>
      )}
    </>
  );
};

export default Notification;
