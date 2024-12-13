import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { AlertCircleIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/components/auth-context';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

type ForgetPasswordSchemaDetails = z.infer<typeof forgetPasswordSchema>;

const forgetPasswordSchema = z.object({
  email: z.string({
    required_error: '邮箱地址是必填项',
  }),
});

const ForgetPasswordScreen = () => {
  const toast = useCustomToast();
  const { forgetPasswordMutation } = useAuth();
  const { reset, error, mutate, isSuccess, isError, isPending } = forgetPasswordMutation;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordSchemaDetails>({
    resolver: zodResolver(forgetPasswordSchema),
  });

  const renderEmail = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.email} size="lg">
      <FormControlLabel>
        <FormControlLabelText>邮箱地址</FormControlLabelText>
      </FormControlLabel>
      <Input variant="rounded">
        <InputField
          placeholder="请输入注册邮箱地址"
          inputMode="email"
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.email?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('发送重置密码邮件成功');
        router.replace('/');
      },
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
        <VStack className="flex-1">
          <VStack space="lg">
            <Controller control={control} name="email" render={renderEmail} />
          </VStack>
          <VStack className="mt-12">
            <Button
              className="rounded-2xl"
              size="lg"
              disabled={isPending}
              onPress={handleSubmit(onSubmit)}>
              <ButtonText>发送验证邮件</ButtonText>
              {isPending && <ButtonSpinner />}
            </Button>
            <Button
              size="lg"
              action="secondary"
              variant="link"
              onPress={() => {
                router.dismiss();
              }}>
              <ButtonText>取消</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default ForgetPasswordScreen;
