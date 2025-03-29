import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useNavigation } from 'expo-router';
import _ from 'lodash';
import { AlertCircleIcon } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { useAuth } from '@/components/auth-provider';
import { AuthHeader } from '@/components/header';
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
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
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

const Login: React.FC = () => {
  const { loginMutation } = useAuth();
  const { mutate, isPending } = loginMutation;
  const toast = useCustomToast();
  const navigation = useNavigation();

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
          onCloseComplete: () => {
            router.replace('/');
          },
        });
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
    <FormControl isInvalid={!!errors.identifier}>
      <FormControlLabel>
        <FormControlLabelText>用户名/邮箱地址</FormControlLabelText>
      </FormControlLabel>
      <Input variant="rounded">
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
          <AuthHeader title="密码登录" />
          <VStack space="md" className="mb-10">
            <Controller control={control} name="identifier" render={renderIdentifier} />
            <Controller control={control} name="password" render={renderPassword} />
          </VStack>
          <VStack>
            <Button className="rounded" onPress={handleSubmit(onSubmit)} disabled={isPending}>
              <ButtonText>登录</ButtonText>
              {isPending && <ButtonSpinner />}
            </Button>
            <Button variant="link" action="secondary" onPress={onCancel}>
              <ButtonText>取消</ButtonText>
            </Button>
          </VStack>
        </KeyboardAwareScrollView>
      </VStack>
    </SafeAreaView>
  );
};

const LoginPage = () => {
  return <Login />;
};

export default LoginPage;
