import { usePathname } from 'expo-router';
import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps } from 'expo-router/ui';
import { BookOpen, House, MessageSquare, User2 } from 'lucide-react-native';
import React, { forwardRef, Ref } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type TabButtonProps = TabTriggerSlotProps & {
  icon?: any;
  text: string;
};

export const TabButton = forwardRef(function TabButton(
  { icon, text, children, isFocused, ...props }: TabButtonProps,
  ref: Ref<View>,
) {
  return (
    <Pressable
      ref={ref}
      {...props}
      className={`rounded-full p-3 ${isFocused ? 'bg-primary-200' : undefined}`}>
      <VStack className="items-center">
        <Icon
          as={icon}
          size={26 as any}
          className={`${isFocused ? 'text-typography-900' : 'text-typography-600'}`}
        />
        <Text size="sm" className={`${isFocused ? 'text-typography-900' : 'text-typography-600'}`}>
          {text}
        </Text>
      </VStack>
    </Pressable>
  );
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList
        className="bg-background-100"
        style={{ paddingBottom: insets.bottom, paddingTop: 10, paddingHorizontal: 20 }}>
        <TabTrigger name="home" href="/" asChild>
          <TabButton text="主页" icon={House}></TabButton>
        </TabTrigger>
        <TabTrigger name="post" href="/post-list" asChild>
          <TabButton text="发现" icon={BookOpen}></TabButton>
        </TabTrigger>
        <TabTrigger name="chat" href="/chat-list" asChild>
          <TabButton text="消息" icon={MessageSquare}></TabButton>
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton text="我的" icon={User2}></TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
