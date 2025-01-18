import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import React, { forwardRef, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { useAuth, AuthHeader } from '@/components/auth-context';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

type OtpSchemaDetails = z.infer<typeof otpSchema>;

const otpSchema = z.object({
  code1: z.string().length(1),
  code2: z.string().length(1),
  code3: z.string().length(1),
  code4: z.string().length(1),
});

const OtpInputField = forwardRef(function OtpInputField(
  { onBlur, onChange, value, inputRefs, index }: any,
  ref: any,
) {
  const nextInputRef = inputRefs[index + 1] || { current: null };
  const prevInputRef = inputRefs[index - 1] || { current: null };

  const onChangeText = (text: string) => {
    onChange(text);

    if (text.length === 1 && nextInputRef.current) {
      nextInputRef.current.focus();
    }
    setTimeout(() => {
      ref.current.setSelection(0, 1);
    }, 0);
  };

  const onKeyPress = ({ nativeEvent: { key } }: any) => {
    if (key === 'Backspace' && !_.isNumber(value) && prevInputRef.current) {
      prevInputRef.current.focus();
    }
  };

  const onFocus = ({ nativeEvent }: any) => {
    ref.current.setSelection(0, value?.length);
  };

  return (
    <Input className="h-12 w-12" variant="underlined">
      <InputField
        ref={ref}
        inputMode="decimal"
        className="text-center text-4xl"
        maxLength={1}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        onChangeText={onChangeText}
        onFocus={onFocus}
        value={value}
      />
    </Input>
  );
});

const OtpConfirmation: React.FC = () => {
  const { email, purpose }: any = useLocalSearchParams();
  const { verifyOtpMutation } = useAuth();
  const toast = useCustomToast();
  const { reset, error, mutate, isSuccess, isError, isPending } = verifyOtpMutation;
  const inputRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];

  const onSubmit = ({ code1, code2, code3, code4 }: any) => {
    const data = {
      email,
      code: `${code1}${code2}${code3}${code4}`,
      purpose,
    };

    mutate(data, {
      onSuccess: () => {
        toast.success({
          title: '操作成功',
          description: '验证码验证成功',
        });
        if (purpose === 'reset-password') {
          router.replace({
            pathname: '/reset-password-otp',
            params: {
              email,
              code: `${code1}${code2}${code3}${code4}`,
              purpose,
            },
          });
        } else {
          router.replace('/');
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

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <VStack className="flex-1 p-4">
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
          <AuthHeader title="验证码" subtitle="请输入4位验证码" />
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

          <Button className="rounded" onPress={handleSubmit(onSubmit)} disabled={isPending}>
            <ButtonText>确定</ButtonText>
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
        </KeyboardAwareScrollView>
      </VStack>
    </SafeAreaView>
  );
};

export default OtpConfirmation;
