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
import { Button, ButtonText } from '@/components/ui/button';
import { useAuth } from '@/components/auth-context';
import { Controller, useForm } from 'react-hook-form';
import { AlertCircleIcon } from 'lucide-react-native';
import { Spinner } from '@/components/ui/spinner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAlertToast from '@/components/use-alert-toast';

const SignUp = () => {
  const { registerMutation } = useAuth();
  const { reset, error, mutate, isSuccess, isError, isPending } = registerMutation;
  const insets = useSafeAreaInsets();
  const toast = useAlertToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => toast.success('注册成功'),
      onError: (error: any) => {
        toast.error(`注册失败`);
        console.error(error);
      },
    });
  };

  return (
    <>
      {isPending && <Spinner className="absolute bottom-0 left-0 right-0 top-0 z-50"></Spinner>}

      <VStack className="flex-1 justify-between p-4" style={{ paddingBottom: insets.bottom }}>
        <VStack className="flex-1" space="lg">
          <Controller
            control={control}
            name="username"
            rules={{
              required: '用户名是必填项',
              validate: (value: any) => {
                return (value.length >= 3 && value.length <= 16) || '用户名长度需在3到16个字符之间';
              },
            }}
            render={({ field: { onChange, onBlur, value } }: any) => (
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
            )}
          />

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
            render={({ field: { onChange, onBlur, value } }: any) => (
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
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: '密码是必填项',
              minLength: { value: 8, message: '密码长度至少为8位' },
            }}
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
                  <FormControlHelperText>密码长度至少为8个字符</FormControlHelperText>
                </FormControlHelper>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{errors?.password?.message}</FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
          <Button className="rounded-3xl" size="lg" onPress={handleSubmit(onSubmit)}>
            <ButtonText>注册</ButtonText>
          </Button>
          <Button className="" size="lg" variant="link">
            <ButtonText>取消</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </>
  );
};

export default SignUp;
