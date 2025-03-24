import React from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Map } from 'lucide-react-native';
import { twMerge } from 'tailwind-merge';
import { useAuth } from './auth-context';
import Notification from './notification';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
export const MainHeader = () => {
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
};

export const IconHeader = ({ className, title, subtitle }: any) => {
  return (
    <HStack className={twMerge('mb-20 items-center', className)} space="md">
      <Image
        alt="logo"
        source={require('../assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 6 }}
      />
      <VStack>
        <Heading>{title}</Heading>
        {subtitle && <Text sub={true}>{subtitle}</Text>}
      </VStack>
    </HStack>
  );
};

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
