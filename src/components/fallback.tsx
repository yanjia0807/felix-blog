import React from 'react';
import { type ErrorBoundaryProps, useRouter, useGlobalSearchParams, Stack } from 'expo-router';
import _ from 'lodash';
import { InfoIcon } from 'lucide-react-native';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';

export const NotFoundFallbackUI: React.FC<any> = () => {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonText>返回首页</ButtonText>
    </Button>
  );
  return (
    <>
      <Stack.Screen
        options={{
          title: '出错了',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 items-center p-4">
          <Alert action="error" variant="solid">
            <VStack space="lg" className="flex-1 items-center">
              <HStack space="md" className="items-center">
                <AlertIcon as={InfoIcon} />
                <AlertText>当前页面不存在。</AlertText>
              </HStack>
              <HStack className="w-full self-start" space="md">
                <Text className="flex-1">{_.join(params['not-found'], '/')}</Text>
              </HStack>
            </VStack>
          </Alert>
        </VStack>
      </SafeAreaView>
    </>
  );
};

export const PageFallbackUI: React.FC<ErrorBoundaryProps> = ({ error, retry }) => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 items-center justify-center p-4">
        <Alert action="error">
          <VStack space="md" className="flex-1 items-center">
            <HStack space="md" className="items-center">
              <AlertIcon as={InfoIcon} size="lg" />
              <AlertText size="lg">当前页面发生了错误。</AlertText>
            </HStack>
            <Divider />
            <HStack className="w-full items-center justify-center" space="md">
              <Button onPress={() => retry()}>
                <ButtonText>重试</ButtonText>
              </Button>
              <Button onPress={() => router.replace('/')}>
                <ButtonText>返回</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </Alert>
      </VStack>
    </SafeAreaView>
  );
};
