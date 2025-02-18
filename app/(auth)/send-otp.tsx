import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { AlertCircleIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { useAuth, AuthHeader } from '@/components/auth-context';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

type SendOtpSchemaDetails = z.infer<typeof sendOtpSchema>;

const sendOtpSchema = z.object({
  email: z
    .string({
      required_error: '邮箱地址是必填项',
    })
    .regex(
      /^[\w-]+(\.[\w-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$/i,
      '邮箱地址格式不正确',
    ),
});

const SendOtp: React.FC = () => {
  const toast = useCustomToast();
  const { sendOtpMutation } = useAuth();
  const { mutate, isPending } = sendOtpMutation;
  const { purpose }: any = useLocalSearchParams();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SendOtpSchemaDetails>({
    resolver: zodResolver(sendOtpSchema),
  });

  const renderEmail = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.email} size="md">
      <FormControlLabel>
        <FormControlLabelText>邮箱地址</FormControlLabelText>
      </FormControlLabel>
      <Input variant="rounded">
        <InputField
          placeholder="请输入注册邮箱地址"
          inputMode="email"
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

  const onSubmit = ({ email }: any) => {
    const data = { email, purpose };

    mutate(data, {
      onSuccess: () => {
        toast.success({
          description: '验证码已发送',
        });
        if (purpose) {
          router.replace({
            pathname: '/otp-confirmation',
            params: {
              email,
              purpose,
            },
          });
        } else {
          router.replace('/');
        }
      },
      onError: (error: any) => {
        toast.error({
          title: '发送失败',
          description: error.message,
        });
      },
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <VStack className="flex-1 p-4">
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
          <AuthHeader title="发送验证码" />
          <VStack space="md" className="mb-10">
            <Controller control={control} name="email" render={renderEmail} />
          </VStack>
          <VStack>
            <Button className="rounded" disabled={isPending} onPress={handleSubmit(onSubmit)}>
              <ButtonText>发送</ButtonText>
              {isPending && <ButtonSpinner />}
            </Button>
            <Button
              variant="link"
              action="secondary"
              onPress={() => {
                router.dismiss();
              }}>
              <ButtonText>取消</ButtonText>
            </Button>
          </VStack>
        </KeyboardAwareScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default SendOtp;
