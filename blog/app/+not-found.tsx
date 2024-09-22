import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "页面不存在" }} />
      <View className="flex-1 justify-center items-center">
        <Link href="/">回到主页</Link>
      </View>
    </>
  );
}
