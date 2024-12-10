import { router, Stack } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const AnonymousSetting = () => {
  const renderHeaderLeft = () => (
    <Button
      size="md"
      action="secondary"
      variant="link"
      onPress={() => {
        router.replace('/');
      }}>
      <ButtonIcon as={X} />
    </Button>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 justify-between p-6" space="xl">
          <VStack>
            <VStack>
              <Heading>登录后，体验完整功能</Heading>
              <Text sub={true}>登录后，您将能享受更多个性化设置和功能</Text>
            </VStack>
            <Button
              size="lg"
              action="primary"
              className="mt-16 rounded-lg"
              onPress={() => {
                router.push('/login');
              }}>
              <ButtonText>密码登录</ButtonText>
            </Button>
          </VStack>
          <HStack className="items-center justify-center" space="lg">
            <Button
              action="secondary"
              variant="link"
              onPress={() => {
                router.push('/register');
              }}>
              <ButtonText>新用户注册</ButtonText>
            </Button>
            <Button
              action="secondary"
              variant="link"
              onPress={() => {
                router.push('/forget-password');
              }}>
              <ButtonText>忘记密码</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </SafeAreaView>
    </>
  );
};

export default AnonymousSetting;
