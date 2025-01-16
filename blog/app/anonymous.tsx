import { router, Stack } from 'expo-router';
import { X } from 'lucide-react-native';
import React from 'react';
import AuthHeader from '@/components/auth-header';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';

const Anonymous: React.FC = () => {
  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.replace('/')}>
      <ButtonIcon as={X} />
      <ButtonText>返回</ButtonText>
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
        <VStack className="flex-1 p-4" space="xl">
          <AuthHeader
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
                  router.push('/register-otp');
                }}>
                <ButtonText>新用户注册</ButtonText>
              </Button>
              <Button
                action="secondary"
                variant="link"
                onPress={() => {
                  router.push({
                    pathname: '/send-otp',
                    params: {
                      purpose: 'verify-email',
                    },
                  });
                }}>
                <ButtonText>验证邮箱</ButtonText>
              </Button>
              <Button
                action="secondary"
                variant="link"
                onPress={() => {
                  router.push({
                    pathname: '/send-otp',
                    params: {
                      purpose: 'reset-password',
                    },
                  });
                }}>
                <ButtonText>忘记密码</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </SafeAreaView>
    </>
  );
};

export default Anonymous;
