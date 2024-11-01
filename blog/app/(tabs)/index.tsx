import React from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { router } from "expo-router";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/components/AuthContext";

const Home = () => {
  const { user, logout } = useAuth();
  return (
    <VStack className="flex-1 p-4" space="md">
      <Button
        onPress={() => {
          router.navigate("/login");
        }}
      >
        <ButtonText>登录</ButtonText>
      </Button>
      <Button
        onPress={() => {
          router.navigate("/register");
        }}
      >
        <ButtonText>注册</ButtonText>
      </Button>
      <Button
        onPress={() => {
          logout();
        }}
      >
        <ButtonText>登出</ButtonText>
      </Button>
      <Button
        onPress={() => {
          router.navigate("/forget-password");
        }}
      >
        <ButtonText>忘记密码</ButtonText>
      </Button>
      <Button
        onPress={() => {
          router.navigate("/reset-password");
        }}
      >
        <ButtonText>设置密码</ButtonText>
      </Button>
    </VStack>
  );
};

export default Home;
