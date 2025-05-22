import React from 'react';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { View, Text } from 'react-native';
import { Button, ButtonIcon } from '@/components/ui/button';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchNotificationCount } from '../api';
import { useListenNotification } from '../api/use-listen-notification';

const NotificationIcon = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { data } = useFetchNotificationCount({ enabled: !!user });
  const count = data;

  const onPress = () => router.navigate('/notifications/list');
  // const onPress = () => router.navigate('/notification');

  useListenNotification();

  return (
    <>
      {user && (
        <Button onPress={onPress} variant="link">
          {count > 0 && (
            <View className="absolute right-0 top-[-2] h-4 w-4 items-center justify-center self-end rounded-full bg-error-600 p-[0.5]">
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-[8px] leading-none text-white">
                {count}
              </Text>
            </View>
          )}
          <ButtonIcon as={Bell} size={22 as any} className="text-secondary-900" />
        </Button>
      )}
    </>
  );
};

export default NotificationIcon;
