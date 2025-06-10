import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useVerifyOtp } from '@/features/auth/api/use-verify-otp';
import { AnonyLogoView } from '@/features/auth/components/anony';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { forwardRef, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';

type OtpSchemaDetails = z.infer<typeof otpSchema>;

const otpSchema = z.object({
  code1: z
    .string()
    .min(1)
    .max(1)
    .regex(/^[0-9]$/),
  code2: z
    .string()
    .min(1)
    .max(1)
    .regex(/^[0-9]$/),
  code3: z
    .string()
    .min(1)
    .max(1)
    .regex(/^[0-9]$/),
  code4: z
    .string()
    .min(1)
    .max(1)
    .regex(/^[0-9]$/),
});

const OtpInputField = forwardRef(function OtpInputField(
  { onBlur, onChange, value, inputRefs, index }: any,
  ref: any,
) {
  const nextInputRef = inputRefs[index + 1] || { current: null };
  const prevInputRef = inputRefs[index - 1] || { current: null };
  const latestTimestamp = useRef<number>(0);

  const onKeyPress = (e: any) => {
    if (Date.now() - latestTimestamp.current < 100 && e.nativeEvent.key === 'Backspace') {
      return;
    } else {
      latestTimestamp.current = Date.now();
    }

    if (e.nativeEvent.key === 'Backspace') {
      if (value.length > 0 && index === inputRefs.length - 1) {
        return onChange('');
      }
      if (prevInputRef.current) {
        onChange('');
        prevInputRef.current.focus();
      }
    } else {
      if (nextInputRef.current) {
        nextInputRef.current.focus();
      }
    }
  };

  const onFocus = (e: any) => {
    onChange('');
  };

  return (
    <Input className="h-12 w-12" variant="underlined">
      <InputField
        ref={ref}
        inputMode="numeric"
        className="text-center text-4xl"
        onKeyPress={onKeyPress}
        onFocus={onFocus}
        maxLength={1}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
      />
    </Input>
  );
});

const OtpConfirmation: React.FC = () => {
  const { email, purpose }: any = useLocalSearchParams();
  const verifyOtpMutation = useVerifyOtp();
  const toast = useToast();
  const navigation = useNavigation();
  const inputRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

  const onSubmit = ({ code1, code2, code3, code4 }: any) => {
    const data = {
      email,
      code: `${code1}${code2}${code3}${code4}`,
      purpose,
    };

    verifyOtpMutation.mutate(data, {
      onSuccess: () => {
        if (purpose === 'verify-email') {
          toast.success({
            title: '操作成功',
            description: '您已注册完成',
            onCloseComplete: () => {
              router.replace('/login');
            },
          });
        } else if (purpose === 'reset-password') {
          toast.success({
            title: '操作成功',
            description: '验证码验证成功',
            onCloseComplete: () => {
              router.push({
                pathname: '/set-password',
                params: {
                  email,
                  code: `${code1}${code2}${code3}${code4}`,
                  purpose,
                },
              });
            },
          });
        }
      },
      onError: (error: any) => {
        toast.error({
          description: error.message,
        });
      },
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpSchemaDetails>({
    resolver: zodResolver(otpSchema),
  });

  const renderInputField = ({
    name,
    index,
    onChange,
    onBlur,
    value,
  }: {
    name: keyof OtpSchemaDetails;
    index: number;
    onChange: (value: string) => void;
    onBlur: () => void;
    value: string;
  }) => (
    <FormControl className="mb-10" isInvalid={!!errors[name]}>
      <OtpInputField
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        ref={inputRefs[index]}
        index={index}
        inputRefs={inputRefs}
      />
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
          <AnonyLogoView title="验证码" subtitle="请输入4位验证码" />
          <HStack className="items-center justify-center" space="lg">
            {(['code1', 'code2', 'code3', 'code4'] as const).map((name, index) => (
              <Controller
                key={index}
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) =>
                  renderInputField({ name, index, onChange, onBlur, value })
                }
              />
            ))}
          </HStack>

          <Button
            className="rounded"
            onPress={handleSubmit(onSubmit)}
            disabled={verifyOtpMutation.isPending}>
            <ButtonText>确定</ButtonText>
            {verifyOtpMutation.isPending && <ButtonSpinner />}
          </Button>
          <Button variant="link" action="secondary" onPress={onCancel}>
            <ButtonText>取消</ButtonText>
          </Button>
        </KeyboardAwareScrollView>
      </VStack>
    </SafeAreaView>
  );
};

const OtpConfirmationPage = () => {
  return <OtpConfirmation />;
};

export default OtpConfirmationPage;
