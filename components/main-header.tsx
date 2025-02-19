import { Image } from 'expo-image';
import React from 'react';
import { useAuth } from './auth-context';
import Notification from './notification';
import { HStack } from './ui/hstack';

const MainHeader = React.memo(function MainHeader() {
  const { user } = useAuth();

  return (
    <HStack className="mb-6 items-center justify-between">
      <Image
        alt="logo"
        source={require('../assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 8 }}
      />
      <HStack className="items-center" space="md">
        {user && <Notification />}
      </HStack>
    </HStack>
  );
});

export default MainHeader;
