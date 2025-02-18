import { Tabs } from 'expo-router';
import { BookOpen, House, MessageCircle, User2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '主页',
          tabBarIcon: ({ focused, color, size }: any) => (
            <Icon as={House} size={size} className={`${focused && 'color-primary-400'}`} />
          ),
        }}
      />
      <Tabs.Screen
        name="post-list"
        options={{
          title: '发现',
          tabBarIcon: ({ color, focused }) => (
            <Icon as={BookOpen} size={26 as any} className={`${focused && 'color-primary-400'}`} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '消息',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              as={MessageCircle}
              size={26 as any}
              className={`${focused && 'color-primary-400'}`}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <Icon as={User2} size={26 as any} className={`${focused && 'color-primary-400'}`} />
          ),
        }}
      />
    </Tabs>
  );
}
