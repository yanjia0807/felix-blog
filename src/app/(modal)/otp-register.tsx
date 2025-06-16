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
import { useOtpRegister } from '@/features/auth/api/use-otp-register';
import { AnonyLogoView } from '@/features/auth/components/anony';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useNavigation } from 'expo-router';
import { AlertCircleIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';

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

const OtpRegisterPage: React.FC = () => {
  const registerOtpMutation = useOtpRegister();
  const toast = useToast();
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaDetails>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: any) => {
    registerOtpMutation.mutate(data, {
      onSuccess: () => {
        toast.success({
          title: '提交成功',
          description: '我们已向您的邮箱发送了一个验证码，请前往查看',
          onCloseComplete: () => {
            router.push({
              pathname: '/otp-confirmation',
              params: { email: data.email, purpose: 'verify-email' },
            });
          },
        });
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
    <FormControl isInvalid={!!errors.username}>
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
    <FormControl isInvalid={!!errors.email}>
      <FormControlLabel>
        <FormControlLabelText>邮箱地址</FormControlLabelText>
      </FormControlLabel>
      <Input variant="rounded">
        <InputField
          placeholder="请输入邮箱地址"
          inputMode="email"
          autoCorrect={false}
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

  const renderPassword = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.password}>
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

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const onCancel = () => {
    navigation.getParent()?.goBack();
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4">
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
          <AnonyLogoView title="用户注册" />
          <VStack space="md">
            <Controller control={control} name="username" render={renderUsername} />
            <Controller control={control} name="email" render={renderEmail} />
            <Controller control={control} name="password" render={renderPassword} />
          </VStack>
          <HStack className="my-10 flex-wrap">
            <Text bold={true} className="leading-8">
              同意服务条款：
            </Text>
            <Text className="leading-8">在点击“注册”按钮前，请阅读并同意我们的</Text>
            <Link onPress={() => router.push('/terms-of-service')}>
              <LinkText className="leading-8 no-underline">服务条款</LinkText>
            </Link>
            <Text className="leading-8">和</Text>
            <Link onPress={() => router.push('/privacy-policy')}>
              <LinkText className="leading-8 no-underline">隐私政策</LinkText>
            </Link>
          </HStack>
          <VStack>
            <Button
              className="rounded"
              action="positive"
              onPress={handleSubmit(onSubmit)}
              disabled={registerOtpMutation.isPending}>
              <ButtonText>注册</ButtonText>
              {registerOtpMutation.isPending && <ButtonSpinner />}
            </Button>
            <Button variant="link" action="negative" onPress={onCancel}>
              <ButtonText>取消</ButtonText>
            </Button>
          </VStack>
        </KeyboardAwareScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default OtpRegisterPage;
