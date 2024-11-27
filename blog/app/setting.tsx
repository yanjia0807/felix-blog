import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { Bell, ChevronRightIcon, KeyRound, LogOut, Moon } from 'lucide-react-native';
import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useAuth } from '@/components/auth-context';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';
import UserInfoHeader from '@/components/user-info-header';

const Setting = () => {
  const toast = useCustomToast();
  const { user, forgetPasswordMutation, logout } = useAuth();
  const { mutate } = forgetPasswordMutation;
  const passwordToastId = _.random(0, 10000).toString();
  const logoutToastId = _.random(0, 10000).toString();

  const onResetPasswordConfirm = () => {
    const data = { email: user.email };
    mutate(data, {
      onSuccess: () => {
        toast.close(passwordToastId);
        toast.success({ description: '发送重置密码邮件成功' });
      },
      onError: (error: any) => {
        toast.error({ description: '发送重置密码邮件失败' });
        console.error(error);
      },
    });
  };

  const onResetPasswordBtnPress = () => {
    toast.confirm({
      toastId: passwordToastId,
      title: '发送重置密码邮件',
      description: `我们会向您的注册邮箱[${user.email}]发送一封重置密码邮件，请用手机打开此链接进行密码重置`,
      onConfirm: onResetPasswordConfirm,
    });
  };

  const onLogoutConfirm = async () => {
    await logout();
    toast.close(logoutToastId);
    toast.success({ description: '退出登录成功' });
    router.navigate('/');
  };

  const onLogoutBtnPress = () => {
    toast.confirm({
      toastId: logoutToastId,
      title: '退出登录',
      description: `确认要退出登录吗？`,
      onConfirm: onLogoutConfirm,
    });
  };

  const renderHeaderLeft = () => (
    <Button
      size="sm"
      action="secondary"
      variant="link"
      onPress={() => {
        router.dismiss();
      }}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: '用户设置',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView className="flex-1">
        {user ? (
          <VStack className="flex-1 p-6" space="xl">
            <UserInfoHeader />
            <Divider />
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <VStack className="flex-1">
                <HStack className="h-14 items-center justify-between p-3">
                  <HStack className="items-center" space="md">
                    <Icon as={Bell} size="lg" />
                    <Text>通知</Text>
                  </HStack>
                  <Switch size="sm" />
                </HStack>
                <Divider />
                <HStack className="h-14 items-center justify-between p-3">
                  <HStack className="items-center" space="md">
                    <Icon as={Moon} size="lg" />
                    <Text>暗模式</Text>
                  </HStack>
                  <Switch size="sm" />
                </HStack>
                <Divider />
                <Pressable onPress={() => onResetPasswordBtnPress()}>
                  <HStack className="h-14 items-center justify-between p-3">
                    <HStack className="items-center" space="md">
                      <Icon as={KeyRound} size="lg" />
                      <Text>设置密码</Text>
                    </HStack>
                    <Icon as={ChevronRightIcon} size="lg" />
                  </HStack>
                </Pressable>
                <Divider />
                <Pressable onPress={() => onLogoutBtnPress()}>
                  <HStack className="mt-6 h-14 items-center justify-center p-3">
                    <HStack className="items-center">
                      <Icon as={LogOut} size="lg" />
                      <Text>退出登录</Text>
                    </HStack>
                  </HStack>
                </Pressable>
              </VStack>
            </ScrollView>
          </VStack>
        ) : (
          <></>
        )}
      </SafeAreaView>
    </>
  );
};

export default Setting;
