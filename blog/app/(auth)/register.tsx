import React, { useState } from 'react';
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

import { useAuth } from '@/components/auth-context';
import { Controller, useForm } from 'react-hook-form';
import { AlertCircleIcon } from 'lucide-react-native';
import { Spinner } from '@/components/ui/spinner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useCustomToast from '@/components/use-custom-toast';
import { router, Stack } from 'expo-router';
import { Link, LinkText } from '@/components/ui/link';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import TermsOfServiceDialog from '@/components/terms-of-service-dialog';
import PrivacyPolicyDialog from '@/components/privacy-policy-dialog';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import colors from 'tailwindcss/colors';

type RegisterSchemaDetails = z.infer<typeof registerSchema>;

const registerSchema = z.object({
  username: z
    .string({
      required_error: '用户名是必填项',
    })
    .min(3, '用户名长度需在3到16个字符之间')
    .max(16, '用户名长度需在3到16个字符之间'),
  email: z
    .string({
      required_error: '邮箱地址是必填项',
    })
    .regex(
      /^[\w-]+(\.[\w-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/i,
      '邮箱地址格式不正确',
    ),
  password: z
    .string({
      required_error: '密码是必填项',
    })
    .min(6, '密码长度至少为6位'),
});

const SignUp = () => {
  const { registerMutation } = useAuth();
  const { reset, error, mutate, isSuccess, isError, isPending } = registerMutation;
  const insets = useSafeAreaInsets();
  const toast = useCustomToast();
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaDetails>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => {
        toast.success({
          title: '注册成功',
          description: '我们已向您的邮箱发送了一封验证邮件，请点击验证',
        });
        router.push('/login');
      },
      onError: (error: any) => {
        toast.error({
          title: '注册失败',
          description: error.message,
        });
      },
    });
  };

  const renderHeaderLeft = () => {
    return (
      <Text size="xl" bold={true}>
        用户注册
      </Text>
    );
  };

  const renderUsername = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.username} size="lg">
      <FormControlLabel>
        <FormControlLabelText>用户名</FormControlLabelText>
      </FormControlLabel>
      <Input variant="rounded">
        <InputField
          placeholder="请输入用户名"
          inputMode="text"
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
      </Input>
      <FormControlHelper className="justify-end">
        <FormControlHelperText>用户名长度需在3到16个字符之间</FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.username?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderEmail = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.email} size="lg">
      <FormControlLabel>
        <FormControlLabelText>邮箱地址</FormControlLabelText>
      </FormControlLabel>
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
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLeft: renderHeaderLeft,
        }}
      />
      <TermsOfServiceDialog
        isOpen={isTermsDialogOpen}
        onClose={() => setIsTermsDialogOpen(false)}
      />
      <PrivacyPolicyDialog
        isOpen={isPrivacyDialogOpen}
        onClose={() => setIsPrivacyDialogOpen(false)}
      />
      <VStack
        className="flex-1 items-center justify-between p-4"
        style={{ paddingBottom: insets.bottom }}>
        <VStack className="flex-1" space="lg">
          <Controller control={control} name="username" render={renderUsername} />
          <Controller control={control} name="email" render={renderEmail} />
          <Controller control={control} name="password" render={renderPassword} />
          <HStack className="my-6 flex-wrap items-center justify-center">
            <Text size="sm">
              <Text size="sm" bold={true}>
                同意服务条款：
              </Text>
              在点击“注册”按钮前，请阅读并同意我们的
              <Link onPress={() => setIsTermsDialogOpen(true)} className="m-0 p-0">
                <LinkText size="sm" underline={false}>
                  服务条款
                </LinkText>
              </Link>
              和
              <Link onPress={() => setIsPrivacyDialogOpen(true)}>
                <LinkText size="sm" underline={false}>
                  隐私政策
                </LinkText>
              </Link>
            </Text>
          </HStack>
          <Button
            className="rounded-3xl"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}>
            <ButtonText>注册</ButtonText>
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
            <Text size="sm">已有账号？</Text>
            <Link
              onPress={() => {
                router.replace('/login');
              }}>
              <LinkText size="sm">登录</LinkText>
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </>
  );
};

export default SignUp;
