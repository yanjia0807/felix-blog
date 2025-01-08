import { Image } from 'expo-image';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useAuth } from './auth-context';
import Notification from './notification';
import { HStack } from './ui/hstack';

const MainHeader = ({ className }: any) => {
  const { user } = useAuth();
  return (
    <HStack className={twMerge('items-center justify-between', className)}>
      <Image
        alt="logo"
        source={require('/assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 8 }}
      />
      <HStack className="items-center" space="md">
        {user && <Notification />}
      </HStack>
    </HStack>
  );
};

export default MainHeader;
