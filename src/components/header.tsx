import NotificationIcon from '@/features/notification/components/notification-icon';
import { UserSearchMenu } from '@/features/user/components/user-search-menu';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import React, { memo } from 'react';
import { useAuth } from '../features/auth/components/auth-provider';
import { Button, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';

export const HeaderLogo = () => {
  return (
    <Image
      alt="logo"
      source={require('@assets/images/icon.png')}
      style={{ width: 40, height: 40, borderRadius: 8 }}
    />
  );
};

export const MainHeader: React.FC<any> = memo(function MainHeader() {
  const { user } = useAuth();

  return (
    <HStack className="w-full items-center justify-between overflow-auto">
      <HeaderLogo />
      <HStack className="items-center" space="lg">
        <UserSearchMenu />
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
