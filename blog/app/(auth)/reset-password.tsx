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
import { useLocalSearchParams } from 'expo-router';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/components/auth-context';
import { Controller, useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/toast';
import InfoToast from '@/components/alert-toast';
import { AlertCircleIcon } from 'lucide-react-native';
import { Spinner } from '@/components/ui/spinner';

const ResetPassword = () => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { resetPasswordMutation } = useAuth();
  const { reset, error, mutate, isSuccess, isError, isPending } = resetPasswordMutation;
  const { code } = useLocalSearchParams();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  });

  const onSubmit = ({ password, passwordConfirmation }: any) => {
    const data = {
      password,
      passwordConfirmation,
      code,
    };
    mutate(data, {
      onSuccess: () => {
        toast.show({
          placement: 'top',
          render: () => <InfoToast description="设置密码成功" action="success" />,
        });
      },
      onError: (error: any) => {
        toast.show({
          placement: 'top',
          render: () => <InfoToast description="设置密码失败" action="error" />,
        });
      },
    });
  };

  return (
    <>
      {isPending && <Spinner className="absolute bottom-0 left-0 right-0 top-0 z-50"></Spinner>}
      <VStack
        className="w-full flex-1 justify-between p-4"
        style={{ paddingBottom: insets.bottom }}>
        <VStack className="flex-1" space="lg">
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

          <Controller
            control={control}
            name="passwordConfirmation"
            rules={{
              required: '确认密码是必填项',
              minLength: { value: 8, message: '确认密码长度至少为8个字符' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl isInvalid={!!errors.passwordConfirmation} size="lg">
                <FormControlLabel>
                  <FormControlLabelText>确认密码</FormControlLabelText>
                </FormControlLabel>
                <Input variant="rounded">
                  <InputField
                    type="password"
                    placeholder="请输入确认密码"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </Input>
                <FormControlHelper className="justify-end">
                  <FormControlHelperText>请再次输入密码</FormControlHelperText>
                </FormControlHelper>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {errors?.passwordConfirmation?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
          <Button className="rounded-3xl" size="lg">
            <ButtonText onPress={handleSubmit(onSubmit)}>设置密码</ButtonText>
          </Button>
          <Button className="" size="lg" variant="link">
            <ButtonText>取消</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </>
  );
};

export default ResetPassword;
