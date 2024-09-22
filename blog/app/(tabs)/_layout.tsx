import React from "react";
import { Tabs } from "expo-router";
import { Home as HomeIcon } from "~/lib/icons/home";
import { SquareActivity as SquareActivityIcon } from "~/lib/icons/square-activity";
import { User as UserIcon } from "~/lib/icons/user";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "主页",
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          tabBarLabel: "帖子",
          tabBarIcon: ({ color }) => <SquareActivityIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "我的",
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
        }}
      />
    </Tabs>
  );
};

export default _layout;
