import React from "react";
import _ from "lodash";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Link } from "expo-router";

const HomeScreen = () => {
  const locale = "zh";
  const openAuthModal = ({ viewName }: any) => {};

  return (
    <View className="flex-1 justify-center items-center gap-4">
      <Link href={`/auth?displayView=register`} asChild>
        <Button variant={"default"} onPress={() => openAuthModal("Register")}>
          <Text>注册</Text>
        </Button>
      </Link>

      <Link href={`/auth?displayView=login`} asChild>
        <Button variant={"default"} onPress={() => openAuthModal("Login")}>
          <Text>登录</Text>
        </Button>
      </Link>
    </View>
  );
};

export default HomeScreen;
