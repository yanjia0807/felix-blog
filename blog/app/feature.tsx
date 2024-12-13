import { router, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '@/components/auth-context';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

const FeatureScreen = () => {
  const { user, logoutMutation } = useAuth();
  const toast = useCustomToast();
  return (
    <VStack className="flex-1 p-4" space="md">
      <Stack.Screen
        options={{
          title: '记录',
          headerShown: true,
          headerRight: () => <></>,
        }}
      />
      <Button
        onPress={() => {
          router.navigate('/login');
        }}>
        <ButtonText>登录</ButtonText>
      </Button>
      <Button
        onPress={() => {
          router.navigate('/register');
        }}>
        <ButtonText>注册</ButtonText>
      </Button>
      <Button onPress={() => logoutMutation()}>
        <ButtonText>登出</ButtonText>
      </Button>
      <Button
        onPress={() => {
          router.navigate('/forget-password');
        }}>
        <ButtonText>忘记密码</ButtonText>
      </Button>
      <Button
        onPress={() => {
          router.navigate('/reset-password');
        }}>
        <ButtonText>设置密码</ButtonText>
      </Button>
      <Button
        onPress={() => {
          router.navigate('/email-confirmation');
        }}>
        <ButtonText>验证成功</ButtonText>
      </Button>
      <Button
        onPress={() => {
          toast.success("Hey! You can't create a duplicate toast");
        }}>
        <ButtonText>提示</ButtonText>
      </Button>
    </VStack>
  );
};

export default FeatureScreen;
