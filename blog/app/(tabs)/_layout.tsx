import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '主页',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: '发现',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="map" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}