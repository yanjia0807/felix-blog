import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { Bell, ChevronRightIcon, Info, Moon, ServerIcon, UserRound } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
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

const AnonymousSetting = () => {
  const toast = useCustomToast();
  const { theme, updateTheme } = usePreferences();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(theme === 'dark');

  const onThemeSwitch = (value: boolean) => {
    setIsDarkMode((prev: boolean) => {
      updateTheme(prev ? 'light' : 'dark');
      return !prev;
    });
  };

  const renderHeaderLeft = () => (
    <Button
      size="md"
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
          title: '设置',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 p-6" space="xl">
          <VStack space="md">
            <HStack>
              <Text className="flex-1 text-center">登录后，您将能享受更多个性化设置和功能！</Text>
            </HStack>
            <HStack className="items-center justify-center" space="lg">
              <Button
                action="primary"
                onPress={() => {
                  router.push('/login');
                }}>
                <ButtonText>登录</ButtonText>
              </Button>
              <Button
                action="primary"
                onPress={() => {
                  router.push('/register');
                }}>
                <ButtonText>注册</ButtonText>
              </Button>
            </HStack>
          </VStack>
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
                <Switch size="sm" value={isDarkMode} onValueChange={onThemeSwitch} />
              </HStack>
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
            </VStack>
          </ScrollView>
        </VStack>
      </SafeAreaView>
    </>
  );
};

export default AnonymousSetting;
