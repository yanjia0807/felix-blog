import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { AlertCircleIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/components/auth-context';
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

type ResetPasswordSchemaDetails = z.infer<typeof resetPasswordSchema>;

const resetPasswordSchema = z.object({
  password: z
    .string({
      required_error: '密码是必填项',
    })
    .min(6, '密码长度至少为6位'),
  passwordConfirmation: z
    .string({
      required_error: '密码是必填项',
    })
    .min(6, '密码长度至少为6位'),
});

const ResetPasswordScreen = () => {
  const toast = useCustomToast();
  const { resetPasswordMutation } = useAuth();
  const { reset, error, mutate, isSuccess, isError, isPending } = resetPasswordMutation;
  const { code } = useLocalSearchParams();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchemaDetails>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = ({ password, passwordConfirmation }: any) => {
    const data = {
      password,
      passwordConfirmation,
      code,
    };

    mutate(data, {
      onSuccess: () => {
        toast.success({
          description: '设置密码成功',
        });
        router.dismissAll();
      },
      onError: (error: any) => {
        toast.error({
          description: error.message,
        });
      },
    });
  };

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

  const renderPasswordConfirmation = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.passwordConfirmation} size="lg">
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
        <FormControlHelperText></FormControlHelperText>
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
        options={{
          title: '设置密码',
        }}
      />
      <VStack className="w-full flex-1 justify-between p-6">
        <VStack className="flex-1" space="lg">
          <Controller control={control} name="password" render={renderPassword} />
          <Controller
            control={control}
            name="passwordConfirmation"
            render={renderPasswordConfirmation}
          />
          <Button className="rounded-3xl" size="lg">
            <ButtonText
              className="rounded-3xl"
              size="lg"
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}>
              设置密码
            </ButtonText>
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
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;
