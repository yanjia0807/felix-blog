import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { AlertCircleIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/components/auth-context';
import PrivacyPolicyDialog from '@/components/privacy-policy-dialog';
import TermsOfServiceDialog from '@/components/terms-of-service-dialog';
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
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '用户注册',
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
      <VStack className="flex-1 items-center justify-between p-6">
        <VStack className="flex-1" space="lg">
          <Controller control={control} name="username" render={renderUsername} />
          <Controller control={control} name="email" render={renderEmail} />
          <Controller control={control} name="password" render={renderPassword} />
          <HStack className="my-6 flex-wrap">
            <Text bold={true}>同意服务条款：</Text>
            <Text>在点击“注册”按钮前，请阅读并同意我们的</Text>
            <Link onPress={() => setIsTermsDialogOpen(true)}>
              <LinkText className="no-underline">服务条款</LinkText>
            </Link>
            <Text>和</Text>
            <Link onPress={() => setIsPrivacyDialogOpen(true)}>
              <LinkText className="no-underline">隐私政策</LinkText>
            </Link>
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
            size="lg"
            variant="link"
            action="secondary"
            onPress={() => {
              router.dismiss();
            }}>
            <ButtonText>取消</ButtonText>
          </Button>
          <HStack className="items-center justify-center" space="sm">
            <Text bold={true}>已有账号？</Text>
            <Button
              variant="link"
              onPress={() => {
                router.replace('/login');
              }}>
              <ButtonText action="secondary" variant="link">
                登录
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default SignUp;
