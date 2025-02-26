import { router, Stack } from 'expo-router';
import _ from 'lodash';
import {
  ChevronLeft,
  ChevronRightIcon,
  Info,
  KeyRound,
  LogOut,
  Moon,
  ServerIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useAuth } from '@/components/auth-context';
import { usePreferences } from '@/components/preferences-provider';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

const Setting: React.FC = () => {
  const toast = useCustomToast();
  const { user, logoutMutation } = useAuth();
  const { theme, updateTheme } = usePreferences();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(theme === 'dark');

  const onChangePasswordBtnPress = () => {
    router.push('/change-password');
  };

  const toastId = 'toastId';
  const onLogoutBtnPress = () => {
    toast.confirm({
      toastId,
      title: '退出登录',
      description: `确认要退出登录吗？`,
      onConfirm: async () => {
        toast.close(toastId);
        await logoutMutation();
        router.replace('/');
        toast.success({ description: '退出登录成功' });
      },
    });
  };

  const onThemeSwitch = (value: boolean) => {
    setIsDarkMode((prev: boolean) => {
      updateTheme(prev ? 'light' : 'dark');
      return !prev;
    });
  };

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
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
          <VStack className="flex-1 px-4" space="xl">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <VStack className="flex-1">
                <HStack className="h-14 items-center justify-between p-3">
                  <HStack className="items-center" space="md">
                    <Icon as={Moon} size="lg" />
                    <Text>暗模式</Text>
                  </HStack>
                  <Switch size="md" value={isDarkMode} onValueChange={onThemeSwitch} />
                </HStack>
                <Divider />
                <Pressable onPress={() => onChangePasswordBtnPress()}>
                  <HStack className="h-14 items-center justify-between p-3">
                    <HStack className="items-center" space="md">
                      <Icon as={KeyRound} size="lg" />
                      <Text>修改密码</Text>
                    </HStack>
                    <Icon as={ChevronRightIcon} size="lg" />
                  </HStack>
                </Pressable>
                <Divider />
                <Pressable>
                  <HStack className="h-14 items-center justify-between p-3">
                    <HStack className="items-center" space="md">
                      <Icon as={ServerIcon} size="lg" />
                      <Text>服务条款 & 隐私政策</Text>
                    </HStack>
                    <Icon as={ChevronRightIcon} size="lg" />
                  </HStack>
                </Pressable>
                <Divider />
                <Pressable>
                  <HStack className="h-14 items-center justify-between p-3">
                    <HStack className="items-center" space="md">
                      <Icon as={Info} size="lg" />
                      <Text>关于</Text>
                    </HStack>
                    <Icon as={ChevronRightIcon} size="lg" />
                  </HStack>
                </Pressable>
                <Divider />
                <Pressable onPress={() => onLogoutBtnPress()}>
                  <HStack className="mt-6 h-14 items-center justify-center p-3">
                    <HStack className="items-center" space="md">
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
