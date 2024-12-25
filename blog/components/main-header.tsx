import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { fetchNotificationCount } from '@/api';
import { useAuth } from './auth-context';
import { useSocket } from './socket-context';
import { Box } from './ui/box';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const MainHeader = ({ className }: any) => {
  const { user } = useAuth();
  const router = useRouter();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => fetchNotificationCount(),
  });

  useEffect(() => {
    socket.on('notification:create', ({ data: newNotification }: any) => {
      queryClient.setQueryData(['notifications', 'count'], (oldData: any) => oldData + 1);
    });
    return () => {
      socket.off('notification:create');
    };
  }, [queryClient]);

  return (
    <HStack className={twMerge('items-center justify-between', className)}>
      <Image
        alt="logo"
        source={require('/assets/images/icon.png')}
        style={{ width: 40, height: 40 }}
      />
      {user ? (
        <TouchableOpacity
          className="m-3"
          onPress={() => {
            router.navigate('/notification-list');
          }}>
          <VStack>
            {data && (
              <Box className="z-10 h-4 w-4 items-center justify-end self-end rounded-full bg-red-600">
                <Text size="xs" className="text-white">
                  {data as any}
                </Text>
              </Box>
            )}
            <Icon as={Bell} size={'xl'} className="text-typography-900" />
          </VStack>
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </HStack>
  );
};

export default MainHeader;
