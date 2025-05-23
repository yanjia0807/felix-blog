import React, { memo } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import NotificationIcon from '@/features/notification/components/notification-icon';
import { Button, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';
import { useAuth } from '../features/auth/components/auth-provider';

export const HeaderLogo = () => {
  return (
    <Image
      alt="logo"
      source={require('../assets/images/icon.png')}
      style={{ width: 40, height: 40, borderRadius: 8 }}
    />
  );
};

export const MainHeader: React.FC<any> = memo(() => {
  const { user } = useAuth();

  return (
    <HStack className="w-full items-center justify-between overflow-auto">
      <HeaderLogo />
      <HStack className="items-center" space="md">
        {!_.isNil(user) && <NotificationIcon />}
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
