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
import { useResetPasswordByOtp } from '@/features/auth/api/use-reset-password-by-otp';
import { AnonyLogoView } from '@/features/auth/components/anony';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { AlertCircleIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';

type SetPasswordSchemaDetails = z.infer<typeof setPasswordSchema>;

const setPasswordSchema = z
  .object({
    password: z
      .string({
        required_error: '新密码是必填项',
      })
      .min(6, '新密码长度至少为6位'),
    passwordConfirmation: z
      .string({
        required_error: '确认密码是必填项',
      })
      .min(6, '确认密码长度至少为6位'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: '两次输入的密码不一致',
    path: ['passwordConfirmation'],
  });

const SetPasswordPage: React.FC = () => {
  const toast = useToast();
  const resetPasswordByOtpMutation = useResetPasswordByOtp();
  const { email, code }: any = useLocalSearchParams();
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordSchemaDetails>({
    resolver: zodResolver(setPasswordSchema),
  });

  const onSubmit = ({ password, passwordConfirmation }: any) => {
    const data = {
      email,
      code,
      password,
      passwordConfirmation,
    };

    resetPasswordByOtpMutation.mutate(data, {
      onSuccess: () => {
        toast.success({
          description: '设置密码成功',
          onCloseComplete: () => {
            router.replace('/login');
          },
        });
      },
      onError: (error: any) => {
        toast.error({
          description: error.message,
        });
      },
    });
  };

  const renderPassword = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.password}>
      <FormControlLabel>
        <FormControlLabelText>新密码</FormControlLabelText>
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
        <FormControlHelperText>新密码长度至少为6个字符</FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.password?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderPasswordConfirmation = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.passwordConfirmation}>
      <FormControlLabel>
        <FormControlLabelText>确认密码</FormControlLabelText>
      </FormControlLabel>
      <Input variant="rounded">
        <InputField
          type="password"
          placeholder="请再次输入密码"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
      </Input>
      <FormControlHelper className="justify-end">
        <FormControlHelperText>确认密码长度至少为6个字符</FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.passwordConfirmation?.message}</FormControlErrorText>
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
          <AnonyLogoView title="设置密码" />
          <VStack space="md" className="mb-10">
            <Controller control={control} name="password" render={renderPassword} />
            <Controller
              control={control}
              name="passwordConfirmation"
              render={renderPasswordConfirmation}
            />
          </VStack>
          <Button
            className="rounded"
            onPress={handleSubmit(onSubmit)}
            disabled={resetPasswordByOtpMutation.isPending}>
            <ButtonText>确定</ButtonText>
            {resetPasswordByOtpMutation.isPending && <ButtonSpinner />}
          </Button>
          <Button variant="link" action="secondary" onPress={onCancel}>
            <ButtonText>取消</ButtonText>
          </Button>
        </KeyboardAwareScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default SetPasswordPage;
