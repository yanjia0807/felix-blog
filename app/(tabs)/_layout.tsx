import { forwardRef, Ref, useEffect } from 'react';
import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import { BookCopy, House, MessageCircle, User, User2 } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferences } from '@/components/preferences-provider';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DefaultTheme, DarkTheme } from '@/constants/router-theme';

export type TabButtonProps = TabTriggerSlotProps & {
  title?: string;
  icon?: any;
};

export const TabButtonList = forwardRef(({ children, ...props }: TabListProps, ref: Ref<View>) => {
  const { theme } = usePreferences();
  const colors = theme === 'light' ? DefaultTheme.colors : DarkTheme.colors;
  const insets = useSafeAreaInsets();

  return (
    <View
      ref={ref}
      {...props}
      className="flex-row items-center justify-around"
      style={{
        paddingTop: 20,
        paddingBottom: insets.bottom,
        backgroundColor: colors.card,
      }}>
      {children}
    </View>
  );
});

export const TabButton = forwardRef(
  ({ icon, title, isFocused, ...props }: TabButtonProps, ref: Ref<View>) => {
    const { theme } = usePreferences();

    const colors = theme === 'light' ? DefaultTheme.colors : DarkTheme.colors;
    const primaryColor = useSharedValue(colors.primary);
    const animatedStyles = useAnimatedStyle(() => ({
      backgroundColor: withSpring(isFocused ? primaryColor.value : 'transparent', {
        damping: 15,
        stiffness: 150,
        mass: 0.5,
      }),
      transform: [{ scale: withSpring(isFocused ? 1.25 : 1) }],
      opacity: withSpring(isFocused ? 1 : 0.75),
    }));

    useEffect(() => {
      primaryColor.value = colors.primary;
    }, [colors.primary]);

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
          </VStack>
        </Animated.View>
      </Pressable>
    );
  },
);

export default function TabLayout() {
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
          <TabTrigger name="message" href="/message" asChild reset="never">
            <TabButton title="消息" icon={MessageCircle} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild reset="never">
            <TabButton title="我的" icon={User2} />
          </TabTrigger>
          {/* <TabTrigger name="feed" href="/feed" asChild reset="never">
            <TabButton title="测试" icon={User} />
          </TabTrigger> */}
        </TabButtonList>
      </TabList>
    </Tabs>
  );
}
