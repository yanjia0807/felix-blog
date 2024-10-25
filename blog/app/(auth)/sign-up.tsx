import React from "react";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";

const SignIn = () => {
  return (
    <Box className="p-4 flex-1 bg-background-0">
    <VStack className="w-full rounded-md border border-background-200 bg-background-100 p-4">
      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>用户名</FormControlLabelText>
        </FormControlLabel>
        <Input size="md" className="my-1">
          <InputField placeholder="请输入用户名" inputMode="text" autoCapitalize="none"/>
        </Input>
        <FormControlHelper>
          <FormControlHelperText>用户名长度需在3到16个字符之间</FormControlHelperText>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon />
          <FormControlErrorText />
        </FormControlError>
      </FormControl>
      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>邮箱地址</FormControlLabelText>
        </FormControlLabel>
        <Input size="md" className="my-1">
          <InputField placeholder="请输入邮箱地址" inputMode="email"
            autoCapitalize="none"/>
        </Input>
        <FormControlHelper>
          <FormControlHelperText />
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon />
          <FormControlErrorText />
        </FormControlError>
      </FormControl>
      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>密码</FormControlLabelText>
        </FormControlLabel>
        <Input size="md" className="my-1">
          <InputField type="password" placeholder="请输入密码" autoCapitalize="none" />
        </Input>
        <FormControlHelper>
        <FormControlHelperText>密码长度至少为8个字符</FormControlHelperText>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon />
          <FormControlErrorText />
        </FormControlError>
      </FormControl>
      <HStack space="md" reversed={true}>
        <Button className="w-fit self-end mt-4" size="md" variant="link">
            <ButtonText >取消</ButtonText>
        </Button>
        <Button className="w-fit self-end mt-4" size="md">
            <ButtonText>注册</ButtonText>
        </Button>
      </HStack>
    </VStack>
    </Box>
  );
};

export default SignIn;
