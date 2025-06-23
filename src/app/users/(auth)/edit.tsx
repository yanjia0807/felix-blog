import { DateInput } from '@/components/date-input';
import { DistrictPicker } from '@/components/district-picker';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { genderEnum } from '@/constants/enum';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useUpdateMe } from '@/features/user/api/use-update-me';
import { AvatarInput } from '@/features/user/components/avatar-input';
import useToast from '@/hooks/use-toast';
import { imageFormat } from '@/utils/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import { AlertCircle, AlertCircleIcon, ChevronDownIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

type UserFormSchema = z.infer<typeof userFormSchema>;

const userFormSchema = z.object({
  username: z.any(),
  email: z.any(),
  bio: z
    .string()
    .max(200, '简介不能超过 200 个字符')
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  gender: z
    .enum(['male', 'female'], {
      invalid_type_error: '性别格式不正确',
    })
    .nullable(),
  birthday: z
    .date({
      invalid_type_error: '出生日期格式不正确',
    })
    .nullable(),
  phoneNumber: z
    .string()
    .refine((val: any) => /^1[3-9]\d{9}$/.test(val), {
      message: '电话号码格式不正确',
    })
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  district: z.any(),
  avatar: z.any(),
});

const UserEdit: React.FC = () => {
  const { user }: any = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const avatar = user?.avatar && {
    id: user.avatar.id,
    data: user.avatar,
    uri: imageFormat(user.avatar, 'l', 's')?.fullUrl,
    preview: imageFormat(user.avatar, 'l')?.fullUrl,
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<UserFormSchema>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      bio: user.bio,
      gender: user.gender,
      birthday: user.birthday ? new Date(user.birthday) : null,
      phoneNumber: user.phoneNumber,
      district: user.district,
      avatar,
    },
  });

  const { isPending, mutate } = useUpdateMe(user.documentId);

  const renderAvatar = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.avatar}>
      <AvatarInput onChange={onChange} value={value} fallbackText={getValues('username')} />
    </FormControl>
  );

  const renderBio = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.bio}>
      <Textarea className="flex-1 border-0 border-b">
        <TextareaInput
          placeholder="我的签名...."
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          className="h-14"
        />
      </Textarea>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.bio?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderGender = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.gender}>
      <FormControlLabel>
        <FormControlLabelText>性别</FormControlLabelText>
      </FormControlLabel>
      <Select
        onValueChange={onChange}
        selectedValue={value}
        initialLabel={genderEnum.find((item: any) => item.value === value)?.label}>
        <SelectTrigger variant="rounded">
          <SelectInput className="flex-1" />
          <SelectIcon className="mr-3" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {genderEnum.map(({ label, value }: any) => (
              <SelectItem key={value} label={label} value={value} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{errors?.gender?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderBirthday = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.birthday}>
      <FormControlLabel>
        <FormControlLabelText>出生日期</FormControlLabelText>
      </FormControlLabel>
      <DateInput value={value} onChange={onChange} placeholder="请选择日期" variant="rounded" />
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{errors?.birthday?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderDistrict = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.district}>
      <FormControlLabel>
        <FormControlLabelText>所在地区</FormControlLabelText>
      </FormControlLabel>
      <DistrictPicker value={value} onChange={onChange} placeholder="请选择所在地区" />
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
      </FormControlError>
    </FormControl>
  );

  const renderPhoneNumber = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.phoneNumber}>
      <FormControlLabel>
        <FormControlLabelText>手机号码</FormControlLabelText>
      </FormControlLabel>
      <Input variant="rounded">
        <InputField
          type="text"
          value={value}
          inputMode="tel"
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder="请输入手机号码"
        />
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{errors?.phoneNumber?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const onSubmit = (formData: UserFormSchema) => {
    mutate(
      {
        formData,
      },
      {
        onSuccess: (data: any) => {
          toast.success({
            title: '操作完成',
            description: '您的资料已更新',
            onCloseComplete: () => {
              router.back();
            },
          });
        },
        onError(error, variables, context) {
          toast.error({ description: error.message });
        },
      },
    );
  };

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

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '编辑资料',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <KeyboardAwareScrollView
        extraKeyboardSpace={-1 * insets.bottom}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <VStack className="flex-1 px-4" space="md">
          <HStack className="h-36 items-center justify-center p-10">
            <Controller name="avatar" control={control} render={renderAvatar} />
          </HStack>
          <VStack className="flex-1" space="md">
            <HStack
              className="items-center rounded-full border-b border-outline-200 bg-background-50 p-2"
              space="md">
              <Text className="font-medium text-typography-900">邮箱地址</Text>
              <Text className="text-typography-400">{getValues('email')}</Text>
            </HStack>
            <HStack
              className="items-center rounded-full border-b border-outline-200 bg-background-50 p-2"
              space="md">
              <Text className="font-medium text-typography-900">用户名</Text>
              <Text className="text-typography-400">{getValues('username')}</Text>
            </HStack>
            <Controller name="bio" control={control} render={renderBio} />
            <Controller name="gender" control={control} render={renderGender} />
            <Controller name="birthday" control={control} render={renderBirthday} />
            <Controller name="phoneNumber" control={control} render={renderPhoneNumber} />
            <Controller name="district" control={control} render={renderDistrict} />
            <Button
              disabled={isPending}
              action="primary"
              className="mt-8 rounded-full"
              onPress={handleSubmit(onSubmit)}>
              <ButtonText>保存</ButtonText>
              {isPending && <ButtonSpinner />}
            </Button>
          </VStack>
        </VStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const UserEditPage = () => {
  return <UserEdit />;
};

export default UserEditPage;
