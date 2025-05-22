import React from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { twMerge } from 'tailwind-merge';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export const AnonyView: React.FC<any> = () => {
  const router = useRouter();

  return (
    <VStack space="lg" className="mt-28 flex-1 items-center">
      <VStack>
        <Heading>登录后，体验完整功能</Heading>
        <Text sub={true}>登录后，您将能享受更多个性化设置和功能</Text>
      </VStack>
      <Button
        action="primary"
        className="rounded"
        onPress={() => {
          router.push('/login');
        }}>
        <ButtonText>密码登录</ButtonText>
      </Button>
    </VStack>
  );
};

export const AnonyLogoView = ({ className, title, subtitle }: any) => {
  return (
    <HStack className={twMerge('mb-20 items-center', className)} space="md">
      <Image
        alt="logo"
        source={require('../../../assets/images/icon.png')}
        style={{ width: 40, height: 40, borderRadius: 6 }}
      />
      <VStack>
        <Heading>{title}</Heading>
        {subtitle && <Text sub={true}>{subtitle}</Text>}
      </VStack>
    </HStack>
  );
};
