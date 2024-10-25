import { View, Text } from "react-native";
import React from "react";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { router } from 'expo-router';

const Home = () => {
  return (
    <Box className="flex-1 p-4">
      <Center>
        <HStack space="md" reversed={false}>
          <Button
            onPress={() => {
              router.navigate("/sign-in");
            }}
          >
            <ButtonText>登录</ButtonText>
          </Button>
          <Button
            onPress={() => {
              router.navigate("/sign-up");
            }}
          >
            <ButtonText>注册</ButtonText>
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
              router.navigate("/create-password");
            }}
          >
            <ButtonText>设置密码</ButtonText>
          </Button>
        </HStack>
      </Center>
    </Box>
  );
};

export default Home;
