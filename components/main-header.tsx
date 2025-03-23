import React, { memo } from 'react';
import { Image } from 'expo-image';
import { useAuth } from './auth-context';
import Notification from './notification';
import { HStack } from './ui/hstack';
import { Map } from 'lucide-react-native';
import { Icon } from './ui/icon';
import { Button, ButtonIcon } from './ui/button';
import { useRouter } from 'expo-router';

const MainHeader = memo(function MainHeader() {
  const { user } = useAuth();
  const router = useRouter();
  return (
    <HStack className="mb-6 items-center justify-between">
      <Image
        alt="logo"
        source={require('../assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 8 }}
      />
      <HStack className="items-center" space="md">
        {user && <Notification />}
        <Button onPress={() => router.navigate('/map')} variant="link">
          <ButtonIcon as={Map} size={22 as any} className="text-secondary-900" />
        </Button>
      </HStack>
    </HStack>
  );
});

export default MainHeader;
