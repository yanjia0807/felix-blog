import { MailIcon } from "lucide-react-native";
import { View } from "react-native";
import { Input } from "./ui/input";

export const MailInput = ({ field: { onChange, value, onBlur } }: any) => (
  <View className="flex-row items-center border-b-hairline border-foreground h-12 mb-2 p-2 ">
    <View className="mr-2">
      <MailIcon className="mr-4 h-12" />
    </View>
    <Input
      value={value}
      onBlur={onBlur}
      onChangeText={(value) => onChange(value)}
      className="flex-1 border-0"
      placeholder="邮箱地址"
      inputMode="email"
      autoCapitalize="none"
    />
  </View>
);
