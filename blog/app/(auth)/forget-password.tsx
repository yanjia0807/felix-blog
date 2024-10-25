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

const ForgetPassword = () => {
  return (
    <Box className="p-4 flex-1 bg-background-0">
    <VStack className="w-full rounded-md border border-background-200 bg-background-100 p-4">
      <FormControl>
        <FormControlLabel>
          <FormControlLabelText>邮箱地址</FormControlLabelText>
        </FormControlLabel>
        <Input size="md" className="my-1">
          <InputField placeholder="请输入邮箱地址" />
        </Input>
        <FormControlHelper>
          <FormControlHelperText />
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
            <ButtonText>发送邮件</ButtonText>
        </Button>
      </HStack>
    </VStack>
    </Box>
  );
};

export default ForgetPassword;
