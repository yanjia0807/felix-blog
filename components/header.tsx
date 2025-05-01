import React, { memo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Bell } from 'lucide-react-native';
import { View } from 'react-native';
import { fetchNotificationCount } from '@/api';
import { useAuth } from './auth-provider';
import { useSocket } from './socket-provider';
import { Button, ButtonText, ButtonIcon } from './ui/button';
import { HStack } from './ui/hstack';
import { Text } from './ui/text';

export const HeaderLogo = () => {
  return (
    <Image
      alt="logo"
      source={require('../assets/images/icon.png')}
      style={{ width: 40, height: 40, borderRadius: 8 }}
    />
  );
};

export const Notification = () => {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const router = useRouter();

  const { data, isSuccess } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => fetchNotificationCount(),
    staleTime: Infinity,
    enabled: !!user,
  });

  const count = isSuccess ? (data as any) + _.filter(notifications, { state: 'unread' }).length : 0;
  return (
    <>
      {user && (
        <Button onPress={() => router.navigate('/notification-list')} variant="link">
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

export const MainHeader: React.FC<any> = memo(() => {
  useEffect(() => console.log('@render MainHeader'));

  const { isLogin } = useAuth();

  return (
    <HStack className="w-full items-center justify-between overflow-auto">
      <HeaderLogo />
      <HStack className="items-center" space="md">
        {isLogin && <Notification />}
      </HStack>
    </HStack>
  );
});

export const BackButton = () => {
  const router = useRouter();

  const onPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (router.canDismiss()) {
      router.dismiss();
    } else {
      router.replace('/');
    }
  };

  return (
    <Button action="secondary" variant="link" onPress={onPress}>
      <ButtonText>返回</ButtonText>
    </Button>
  );
};
