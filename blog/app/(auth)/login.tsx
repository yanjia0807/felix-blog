import React from 'react';
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
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { useAuth } from '@/components/auth-context';
import { Controller, useForm } from 'react-hook-form';
import { AlertCircleIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAlertToast from '@/components/use-alert-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { Link, LinkText } from '@/components/ui/link';

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
  const insets = useSafeAreaInsets();
  const toast = useAlertToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaDetails>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        toast.success({
          title: '登录成功',
          description: '欢迎回来',
        });
        router.dismissAll();
      },
      onError: (error: any) => {
        toast.error({
          title: '登录失败',
          description: error.message,
        });
      },
    });
  };

  const renderHeaderLeft = () => {
    return (
      <Text size="xl" bold={true}>
        用户登录
      </Text>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack
        className="w-full flex-1 justify-between p-4"
        style={{ paddingBottom: insets.bottom }}>
        <VStack className="flex-1" space="lg">
          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }: any) => (
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
                <FormControlHelper className="justify-end">
                  <FormControlHelperText></FormControlHelperText>
                </FormControlHelper>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{errors?.identifier?.message}</FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
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
            )}
          />
          <Button
            className="rounded-3xl"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}>
            <ButtonText>登录</ButtonText>
            {isPending && <ButtonSpinner />}
          </Button>
          <Button
            className=""
            size="lg"
            variant="link"
            onPress={() => {
              router.dismiss();
            }}>
            <ButtonText>取消</ButtonText>
          </Button>
          <HStack space="sm" className="items-center justify-center">
            <Link
              onPress={() => {
                router.push('/register');
              }}>
              <LinkText size="sm">注册新用户</LinkText>
            </Link>
          </HStack>
        </VStack>
        <HStack space="lg" reversed={true}></HStack>
      </VStack>
    </>
  );
};

export default SignIn;
