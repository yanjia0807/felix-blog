import { Image } from 'expo-image';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import Notification from './notification';
import { HStack } from './ui/hstack';

const MainHeader = ({ className }: any) => {
  return (
    <HStack className={twMerge('items-center justify-between', className)}>
      <Image
        alt="logo"
        source={require('/assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 8 }}
      />
      <Notification />
    </HStack>
  );
};

export default MainHeader;
