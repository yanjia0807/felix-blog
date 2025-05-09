import React, { useState } from 'react';
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
import { ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/components/auth-provider';
import { PageFallbackUI } from '@/components/fallback';
import { usePreferences } from '@/components/preferences-provider';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useToast from '@/hooks/use-custom-toast';

const Setting: React.FC = () => {
  const toast = useToast();
  const { user, logoutMutation } = useAuth();
  const { theme, updateTheme } = usePreferences();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(theme === 'dark');

  const onLogoutBtnPress = () => {
    toast.confirm({
      title: '退出登录',
      description: `确认要退出登录吗？`,
      onConfirm: async () => {
        toast.close();
        await logoutMutation.mutate();
        toast.success({
          description: '退出登录成功',
          onCloseComplete: () => {
            router.replace('/');
          },
        });
      },
    });
  };

  const onThemeSwitch = (value: boolean) => {
    setIsDarkMode(value);
    updateTheme(value ? 'dark' : 'light');
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
                <TouchableOpacity onPress={() => router.push('/change-password')}>
                  <HStack className="h-14 items-center justify-between p-3">
                    <HStack className="items-center" space="md">
                      <Icon as={KeyRound} size="lg" />
                      <Text>修改密码</Text>
                    </HStack>
                    <Icon as={ChevronRightIcon} size="lg" />
                  </HStack>
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity onPress={() => router.push('/service-and-policy')}>
                  <HStack className="h-14 items-center justify-between p-3">
                    <HStack className="items-center" space="md">
                      <Icon as={ServerIcon} size="lg" />
                      <Text>服务条款 & 隐私政策</Text>
                    </HStack>
                    <Icon as={ChevronRightIcon} size="lg" />
                  </HStack>
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity>
                  <HStack className="h-14 items-center justify-between p-3">
                    <HStack className="items-center" space="md">
                      <Icon as={Info} size="lg" />
                      <Text>关于</Text>
                    </HStack>
                    <Icon as={ChevronRightIcon} size="lg" />
                  </HStack>
                </TouchableOpacity>
                <Divider />
                <TouchableOpacity onPress={() => onLogoutBtnPress()}>
                  <HStack className="mt-6 h-14 items-center justify-center p-3">
                    <HStack className="items-center" space="md">
                      <Icon as={LogOut} size="lg" />
                      <Text>退出登录</Text>
                    </HStack>
                  </HStack>
                </TouchableOpacity>
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

const SettingPage = () => {
  return <Setting />;
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default SettingPage;
