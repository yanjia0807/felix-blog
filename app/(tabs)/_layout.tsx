import { forwardRef, Ref } from 'react';
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { House, MessageCircle, Pentagon, User2, Waves } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export type TabButtonProps = TabTriggerSlotProps & {
  title?: string;
  icon?: any;
};

export const TabButtonList = forwardRef(({ children, ...props }: TabListProps, ref: Ref<View>) => {
  return (
    <Card ref={ref} {...props} className="px-6">
      {children}
    </Card>
  );
});

export const TabButton = forwardRef(
  ({ icon, title, isFocused, ...props }: TabButtonProps, ref: Ref<View>) => {
    return (
      <Pressable
        ref={ref}
        {...props}
        className={`rounded-full px-2 py-[2.5] ${isFocused ? 'bg-primary-200' : ''}`}>
        <VStack className="items-center" space="xs">
          <Icon
            as={icon}
            size={22 as any}
            className={isFocused ? 'text-typography-700' : 'text-typography-600'}
          />
          <Text
            size="2xs"
            bold={isFocused}
            className={isFocused ? 'text-typography-700' : 'text-typography-600'}>
            {title}
          </Text>
        </VStack>
      </Pressable>
    );
  },
);

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />
      <TabList asChild style={{ paddingBottom: insets.bottom }}>
        <TabButtonList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton title="主页" icon={House} />
          </TabTrigger>
          <TabTrigger name="post-list" href="/post-list" asChild>
            <TabButton title="发现" icon={Pentagon} />
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <TabButton title="消息" icon={MessageCircle} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton title="我的" icon={User2} />
          </TabTrigger>
          <TabTrigger name="map" href="/test" asChild>
            <TabButton title="测试" icon={Waves} />
          </TabTrigger>
        </TabButtonList>
      </TabList>
    </Tabs>
  );
}
