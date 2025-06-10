import { useRouter } from 'expo-router';
import { InfoIcon } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderLogo } from './header';
import { Alert, AlertIcon, AlertText } from './ui/alert';
import { Button, ButtonText } from './ui/button';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

export const ErrorFallback = ({ resetErrorBoundary, error }) => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <VStack className="items-center justify-center p-4" space="md">
        <HStack className="w-full items-center justify-between overflow-auto">
          <HeaderLogo />
        </HStack>
        <Heading>啊呀！出了点问题</Heading>
        <Alert action="error" variant="solid" className="m-4">
          <AlertIcon as={InfoIcon} />
          <AlertText>{error.message}</AlertText>
        </Alert>
        <HStack className="items-center justify-center" space="md">
          <Button onPress={resetErrorBoundary} variant="link">
            <ButtonText>重试</ButtonText>
          </Button>
          <Button onPress={() => router.replace('/')} variant="link">
            <ButtonText>回到主页</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </SafeAreaView>
  );
};

export const Error404Fallback = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <HStack className="w-full items-center justify-between overflow-auto">
        <HeaderLogo />
      </HStack>
      <VStack className="items-center justify-center p-4" space="md">
        <Heading>啊呀！出了点问题</Heading>
        <Alert action="error" variant="solid" className="m-4">
          <AlertIcon as={InfoIcon} />
          <AlertText>未找到当前页面</AlertText>
        </Alert>
        <HStack className="items-center justify-center" space="md">
          <Button onPress={() => router.navigate('/')} variant="link" action="default">
            <ButtonText>回到主页</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </SafeAreaView>
  );
};
