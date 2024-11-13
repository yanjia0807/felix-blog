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
import { HStack } from '@/components/ui/hstack';
import { useAuth } from '@/components/auth-context';
import { Controller, useForm } from 'react-hook-form';
import { AlertCircleIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAlertToast from '@/components/use-alert-toast';

const SignIn = () => {
  const { loginMutation } = useAuth();
  const { reset, error, mutate, isSuccess, isError } = loginMutation;
  const insets = useSafeAreaInsets();
  const toast = useAlertToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = (data: any) => {
    mutate(data, {
      onSuccess: () => toast.success('登录成功'),
      onError: (error: any) => {
        toast.error('登录失败');
        console.error(error);
      },
    });
  };

  return (
    <VStack className="w-full flex-1 justify-between p-4" style={{ paddingBottom: insets.bottom }}>
      <VStack className="flex-1" space="lg">
        <Controller
          control={control}
          name="identifier"
          rules={{ required: '用户名/邮箱地址是必填项' }}
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
          rules={{
            required: '密码是必填项',
            minLength: { value: 8, message: '密码长度至少为8个字符' },
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
          <ButtonText>登录</ButtonText>
        </Button>
        <Button className="" size="lg" variant="link">
          <ButtonText>取消</ButtonText>
        </Button>
      </VStack>
      <HStack space="lg" reversed={true}></HStack>
    </VStack>
  );
};

export default SignIn;
