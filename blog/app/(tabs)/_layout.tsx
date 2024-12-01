import { Tabs } from 'expo-router';
import { Home, Map, NotebookPen, User2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: '主页',
          tabBarIcon: ({ color }) => <Icon size={26} as={Home} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: '发现',
          tabBarIcon: ({ color }) => <Icon size={26} as={NotebookPen} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '朋友',
          tabBarIcon: ({ color }) => <Icon size={26} as={Map} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <Icon size={26} as={User2} color={color} />,
        }}
      />
    </Tabs>
  );
}
