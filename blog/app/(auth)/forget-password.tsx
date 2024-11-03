import React from "react";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { Controller, useForm } from "react-hook-form";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import InfoToast from "@/components/alert-toast";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth-context";
import { AlertCircleIcon } from "lucide-react-native";
import { Spinner } from "@/components/ui/spinner";

const ForgetPassword = () => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { forgetPasswordMutation } = useAuth();

  const { reset, error, mutate, isSuccess, isError, isPending } =
    forgetPasswordMutation;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        toast.show({
          placement: "top",
          render: () => (
            <InfoToast description="发送重置密码邮件成功" action="success" />
          ),
        });
      },
      onError: (error: any) => {
        toast.show({
          placement: "top",
          render: () => (
            <InfoToast description="发送重置密码邮件失败" action="error" />
          ),
        });
      },
    });
  };

  return (
    <>
      {isPending && (
        <Spinner className="absolute top-0 right-0 bottom-0 left-0 z-50"></Spinner>
      )}
      <VStack
        className="w-full flex-1 justify-between p-4"
        style={{ paddingBottom: insets.bottom }}
      >
        <VStack className="flex-1" space="lg">
          <Controller
            control={control}
            name="email"
            rules={{
              required: "邮箱地址是必填项",
              pattern: {
                value:
                  /^[\w-]+(\.[\w-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/i,
                message: "邮箱地址格式不正确",
              },
            }}
            render={({ field: { onChange, onBlur, value } }: any) => (
              <FormControl isInvalid={!!errors.email} size="lg">
                <Input variant="rounded">
                  <InputField
                    placeholder="请输入邮箱地址"
                    inputMode="email"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </Input>
                <FormControlHelper className="justify-end">
                  <FormControlHelperText></FormControlHelperText>
                </FormControlHelper>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {errors?.email?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
          <Button
            className="rounded-3xl"
            size="lg"
            onPress={handleSubmit(onSubmit)}
          >
            <ButtonText>发送邮件</ButtonText>
          </Button>
          <Button className="" size="lg" variant="link">
            <ButtonText>取消</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </>
  );
};

export default ForgetPassword;
