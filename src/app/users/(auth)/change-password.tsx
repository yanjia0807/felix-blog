import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
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
import { useChangePassword } from '@/features/auth/api/use-change-password';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { AlertCircleIcon, ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';

type ChangePasswordSchemaDetails = z.infer<typeof changePasswordSchema>;

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({
        required_error: '当前密码是必填项',
      })
      .min(6, '当前密码长度至少为6位'),
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
  .refine((data) => data.password !== data.currentPassword, {
    message: '新密码不能与当前密码相同',
    path: ['password'],
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: '两次输入的密码不一致',
    path: ['passwordConfirmation'],
  });

const ChangePasswordPage: React.FC = () => {
  const changePasswordMutation = useChangePassword();
  const toast = useToast();

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordSchemaDetails>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (formData: any) => {
    changePasswordMutation.mutate(formData, {
      onSuccess: () => {
        toast.success({
          description: `修改密码成功`,
        });

        router.back();
      },
      onError: (error: any) => {
        toast.error({
          description: error.message,
        });
      },
    });
  };

  const renderCurrentPassword = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.currentPassword}>
      <FormControlLabel>
        <FormControlLabelText>当前密码</FormControlLabelText>
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
        <FormControlErrorText>{errors?.currentPassword?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

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
          placeholder="请输入确认密码"
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

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{ headerShown: true, title: '修改密码', headerLeft: renderHeaderLeft }}
      />
      <VStack className="flex-1 p-4">
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
          <VStack space="md" className="mb-10">
            <Controller control={control} name="currentPassword" render={renderCurrentPassword} />
            <Controller control={control} name="password" render={renderPassword} />
            <Controller
              control={control}
              name="passwordConfirmation"
              render={renderPasswordConfirmation}
            />
          </VStack>
          <VStack>
            <Button
              className="rounded"
              onPress={handleSubmit(onSubmit)}
              disabled={changePasswordMutation.isPending}>
              <ButtonText>确定</ButtonText>
              {changePasswordMutation.isPending && <ButtonSpinner />}
            </Button>
            <Button
              variant="link"
              action="secondary"
              onPress={() => {
                router.back();
              }}>
              <ButtonText>取消</ButtonText>
            </Button>
          </VStack>
        </KeyboardAwareScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default ChangePasswordPage;
