import { usePreferences } from '@/components/preferences-provider';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DarkTheme, DefaultTheme } from '@/constants/router-theme';
import { useFetchChatsUnreadCount } from '@/features/chat/api/use-fetch-chats-unread-count';
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { BookCopy, House, MessageCircle, User2 } from 'lucide-react-native';
import React, { forwardRef, Ref, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabButtonProps = TabTriggerSlotProps & {
  title?: string;
  icon?: any;
  badge?: any;
};

export const TabButtonList = forwardRef(function TabButtonList(
  { children, ...props }: TabListProps,
  ref: Ref<View>,
) {
  const { theme } = usePreferences();
  const colors = theme === 'light' ? DefaultTheme.colors : DarkTheme.colors;
  const insets = useSafeAreaInsets();

  return (
    <View
      ref={ref}
      {...props}
      className="flex-row items-center justify-around"
      style={{
        height: 92,
        paddingBottom: insets.bottom,
        backgroundColor: colors.card,
      }}>
      {children}
    </View>
  );
});

const TabButton = forwardRef(function TabButton(
  { icon, title, isFocused, badge, ...props }: TabButtonProps,
  ref: Ref<View>,
) {
  const { theme } = usePreferences();

  const colors = theme === 'light' ? DefaultTheme.colors : DarkTheme.colors;
  const primaryColor = useSharedValue(colors.primary);
  const animatedStyles = useAnimatedStyle(() => ({
    backgroundColor: withSpring(isFocused ? primaryColor.value : 'transparent'),
    transform: [{ scale: withSpring(isFocused ? 1.25 : 1) }],
    opacity: withSpring(isFocused ? 1 : 0.75),
  }));

  useEffect(() => {
    primaryColor.value = colors.primary;
  }, [colors.primary, primaryColor]);

  return (
    <Pressable ref={ref} {...props}>
      <Animated.View className="h-11 w-11 rounded-full" style={[animatedStyles]}>
        <VStack className="items-center" space="xs">
          <Icon as={icon} size="xl" />
          <Text
            size="2xs"
            bold={true}
            style={{
              color: colors.text,
            }}>
            {title}
          </Text>
          {badge && badge()}
        </VStack>
      </Animated.View>
    </Pressable>
  );
});

export default function TabLayout() {
  const chatsUnreadCount = useFetchChatsUnreadCount();
  const renderChatBadge = () => {
    return (
      chatsUnreadCount.data && (
        <View className="absolute right-0 top-[-2] h-2 w-2 rounded-full bg-error-600 p-[0.5]" />
      )
    );
  };
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <TabButtonList>
          <TabTrigger name="home" href="/" asChild reset="never">
            <TabButton title="主页" icon={House} />
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild reset="never">
            <TabButton title="发现" icon={BookCopy} />
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild reset="never">
            <TabButton title="聊天" icon={MessageCircle} badge={renderChatBadge} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild reset="never">
            <TabButton title="我的" icon={User2} />
          </TabTrigger>
        </TabButtonList>
      </TabList>
    </Tabs>
  );
}
