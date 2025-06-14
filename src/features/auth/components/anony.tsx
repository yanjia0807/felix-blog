import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';
import { twMerge } from 'tailwind-merge';

export const AnonyView: React.FC<any> = ({ className }) => {
  const router = useRouter();

  return (
    <HStack className={twMerge('items-center', className)} space="sm">
      <Text size="sm">登录后，体验完整功能</Text>
      <Divider orientation="vertical" />
      <Button
        size="sm"
        action="primary"
        variant="link"
        onPress={() => {
          router.push('/login');
        }}>
        <ButtonText>登录</ButtonText>
      </Button>
      <Button
        size="sm"
        action="primary"
        variant="link"
        onPress={() => {
          router.push('/otp-register');
        }}>
        <ButtonText>新用户注册</ButtonText>
      </Button>
    </HStack>
  );
};

export const AnonyLogoView = ({ className, title, subtitle }: any) => {
  return (
    <HStack className={twMerge('mb-20 items-center', className)} space="md">
      <Image
        alt="logo"
        source={require('@assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 6 }}
      />
      <VStack>
        <Heading>{title}</Heading>
        {subtitle && <Text sub={true}>{subtitle}</Text>}
      </VStack>
    </HStack>
  );
};
