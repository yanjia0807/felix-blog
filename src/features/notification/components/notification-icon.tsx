import React from 'react';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchNotificationCount } from '../api';

const NotificationIcon = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { data } = useFetchNotificationCount({ enabled: !!user });
  const count = data;

  const onPress = () => router.navigate('/notifications/list');

  return (
    <>
      {user && (
        <TouchableOpacity onPress={onPress}>
          {count > 0 && (
            <View className="absolute right-0 top-0 h-4 w-4 items-center justify-center self-end rounded-full bg-error-600 p-[0.5]">
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-[8px] leading-none text-white">
                {count}
              </Text>
            </View>
          )}
          <Icon as={Bell} size="xl" className="text-secondary-900" />
        </TouchableOpacity>
      )}
    </>
  );
};

export default NotificationIcon;
