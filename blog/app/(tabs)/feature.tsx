import React from 'react';
import { Button, ButtonText } from '@/components/ui/button';
import { router, Stack } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/components/auth-context';
import { ProfileAvatar } from '@/components/profile-avatar';
import useAlertToast from '@/components/use-alert-toast';

const Feature = () => {
  const { user, logout } = useAuth();
  const toast = useAlertToast();
  return (
    <VStack className="flex-1 p-4" space="md">
      <Stack.Screen
        options={{
          title: '记录',
          headerShown: true,
          headerRight: () => <ProfileAvatar />,
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
      <Button
        onPress={() => {
          logout();
        }}>
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
          toast.success("Hey! You can't create a duplicate toast");
        }}>
        <ButtonText>提示</ButtonText>
      </Button>
    </VStack>
  );
};

export default Feature;
