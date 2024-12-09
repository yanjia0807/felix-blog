import { Stack } from 'expo-router';
import { AlertCircleIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useAuth } from '@/components/auth-context';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

const ForgetPassword = () => {
  const toast = useCustomToast();
  const { forgetPasswordMutation } = useAuth();
  const { reset, error, mutate, isSuccess, isError, isPending } = forgetPasswordMutation;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const renderEmail = ({ field: { onChange, onBlur, value } }: any) => (
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
        <FormControlErrorText>{errors?.email?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => toast.success('发送重置密码邮件成功'),
      onError: (error: any) => {
        toast.error(`发送重置密码邮件失败`);
        console.error(error);
      },
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '忘记密码',
        }}
      />
      <VStack className="w-full flex-1 justify-between p-6">
        <VStack className="flex-1" space="lg">
          <Controller
            control={control}
            name="email"
            rules={{
              required: '邮箱地址是必填项',
              pattern: {
                value: /^[\w-]+(\.[\w-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/i,
                message: '邮箱地址格式不正确',
              },
            }}
            render={renderEmail}
          />
          <Button className="rounded-3xl" size="lg" onPress={handleSubmit(onSubmit)}>
            <ButtonText>发送邮件</ButtonText>
          </Button>
          <Button className="" size="lg" variant="link">
            <ButtonText>取消</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default ForgetPassword;
