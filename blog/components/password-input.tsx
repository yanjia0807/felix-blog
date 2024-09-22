import { KeyIcon, EyeIcon, EyeOffIcon } from "lucide-react-native";
import { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Input } from "./ui/input";

export const PasswordInput = ({ field: { onChange, value, onBlur } }: any) => {
  const [isPasswordVisible, setPasswordVisible] = useState(false); // 控制密码显示和隐藏

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className="flex-row items-center border-b-hairline border-foreground h-12 mb-2 p-2 ">
      <View className="mr-2">
        <KeyIcon />
      </View>
      <Input
        value={value}
        onBlur={onBlur}
        onChangeText={(value) => onChange(value)}
        className="flex-1 border-0"
        placeholder="密码"
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={togglePasswordVisibility} className="ml-4">
        {isPasswordVisible ? <EyeIcon /> : <EyeOffIcon />}
      </TouchableOpacity>
    </View>
  );
};
