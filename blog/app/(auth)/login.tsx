import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
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
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Link, LinkText } from '@/components/ui/link';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

type LoginSchemaDetails = z.infer<typeof loginSchema>;

const loginSchema = z.object({
  identifier: z.string({
    required_error: '用户名/邮箱地址是必填项',
  }),
  password: z
    .string({
      required_error: '密码是必填项',
    })
    .min(6, '密码长度至少为6位'),
});

const SignIn = () => {
  const { loginMutation } = useAuth();
  const { reset, error, mutate, isSuccess, isError, isPending } = loginMutation;
  const toast = useCustomToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaDetails>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (formData: any) => {
    mutate(formData, {
      onSuccess: (data: any) => {
        toast.success({
          title: '登录成功',
          description: `${data.user.username}，欢迎回来`,
        });

        _.delay(() => {
          router.replace('/');
        }, 1200);
      },
      onError: (error: any) => {
        toast.error({
          title: '登录失败',
          description: error.message,
        });
      },
    });
  };

  const renderIdentifier = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.identifier} size="lg">
      <FormControlLabel>
        <FormControlLabelText>用户名/邮箱地址</FormControlLabelText>
      </FormControlLabel>
      <Input className="my-1" variant="rounded">
        <InputField
          placeholder="请输入用户名或邮箱地址"
          inputMode="text"
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.identifier?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderPassword = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.password} size="lg">
      <FormControlLabel>
        <FormControlLabelText>密码</FormControlLabelText>
      </FormControlLabel>
      <Input variant="rounded">
        <InputField
          type="password"
          placeholder="请输入密码"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
      </Input>
      <FormControlHelper className="justify-end">
        <FormControlHelperText>密码长度至少为6个字符</FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.password?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '密码登录',
        }}
      />
      <VStack className="w-full flex-1 justify-between p-6">
        <VStack className="flex-1">
          <VStack space="lg">
            <Controller control={control} name="identifier" render={renderIdentifier} />
            <Controller control={control} name="password" render={renderPassword} />
          </VStack>
          <VStack className="mt-12">
            <Button
              className="rounded-2xl"
              size="lg"
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}>
              <ButtonText>登录</ButtonText>
              {isPending && <ButtonSpinner />}
            </Button>
            <Button
              variant="link"
              action="secondary"
              size="lg"
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

export default SignIn;
