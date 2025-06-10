import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { AnonyLogoView } from '@/features/auth/components/anony';
import { router, Stack } from 'expo-router';
import React from 'react';

const AnonyPage: React.FC = () => {
  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.replace('/');
      }}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4" space="xl">
        <AnonyLogoView
          title="登录后，体验完整功能"
          subtitle="登录后，您将能享受更多个性化设置和功能"
        />
        <VStack space="lg">
          <Button
            action="primary"
            className="rounded"
            onPress={() => {
              router.push('/login');
            }}>
            <ButtonText>密码登录</ButtonText>
          </Button>
          <HStack className="items-center justify-end" space="lg">
            <Button
              action="secondary"
              variant="link"
              onPress={() => {
                router.push('/otp-register');
              }}>
              <ButtonText>新用户注册</ButtonText>
            </Button>
            <Button
              action="secondary"
              variant="link"
              onPress={() => {
                router.push('/verify-email');
              }}>
              <ButtonText>验证邮箱</ButtonText>
            </Button>
            <Button
              action="secondary"
              variant="link"
              onPress={() => {
                router.push('/reset-password');
              }}>
              <ButtonText>忘记密码</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default AnonyPage;
