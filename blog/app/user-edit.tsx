import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import {
  CameraIcon,
  ChevronDownIcon,
  AlertCircle,
  AlertCircleIcon,
  ChevronLeft,
} from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { updateUser } from '@/api';
import { useAuth } from '@/components/auth-context';
import { DateInput } from '@/components/date-input';
import { DistrictInput } from '@/components/district-input';
import { Avatar, AvatarImage, AvatarBadge } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';
import { genderEnum } from '@/constants/enum';

const UserEditScreen = () => {
  const { user }: any = useAuth();
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const insets = useSafeAreaInsets();

  type UserSchemaDetails = z.infer<typeof userSchema>;

  const userSchema = z.object({
    bio: z.union([z.null(), z.string().max(200, '简介不能超过 200 个字符')]),
    gender: z.union([
      z.null(),
      z.enum(['male', 'female'], {
        invalid_type_error: '性别是必填项',
      }),
    ]),
    birthday: z.union([
      z.null(),
      z.date({
        required_error: '出生日期是必填项',
        invalid_type_error: '出生日期格式不正确',
      }),
    ]),
    phoneNumber: z
      .string()
      .nullable()
      .refine((val) => val === null || val === '' || /^1[3-9]\d{9}$/.test(val), {
        message: '电话号码格式不正确',
      })
      .transform((val) => (val === '' ? null : val)),
    district: z
      .union([z.null(), z.object({})])
      .nullable()
      .refine(
        (val) => {
          return val === null || (typeof val === 'object' && !Array.isArray(val));
        },
        {
          message: '所在区域格式不正确',
        },
      ),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<UserSchemaDetails>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      bio: user.bio,
      gender: user.gender,
      birthday: user.birthday ? new Date(user.birthday) : null,
      phoneNumber: user.phoneNumber,
      district: user.district,
    },
  });
  const { isSuccess, isError, isPending, mutate } = useMutation({
    mutationFn: ({ id, data }: any) => {
      return updateUser({ id, data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      toast.success({ title: '操作完成', description: '您的资料已更新' });
      router.navigate('/profile');
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
  });

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
      <DateInput value={value} onChange={onChange} placeholder="请选择日期" />
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
      <DistrictInput value={value} onChange={onChange} placeholder="请选择所在地区" />
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{errors?.district?.message}</FormControlErrorText>
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

  const onSubmit = (data: UserSchemaDetails) => {
    mutate({
      id: user.id,
      data,
    });
  };

  const renderHeaderLeft = () => (
    <Button
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
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
        <VStack className="flex-1 p-6" space="lg">
          <Box className="h-36">
            <Center className="absolute top-2 w-full">
              <Avatar size="2xl">
                <AvatarImage source={require('@/assets/images/profile/image.png')} />
                <AvatarBadge className="items-center justify-center">
                  <Icon as={CameraIcon} />
                </AvatarBadge>
              </Avatar>
            </Center>
          </Box>
          <VStack className="flex-1" space="lg">
            <HStack
              className="items-center rounded-full border-b border-outline-200 bg-background-50 p-2 px-4"
              space="md">
              <Text bold={true}>邮箱地址</Text>
              <Text className="text-typography-400">{user.email}</Text>
            </HStack>
            <HStack
              className="items-center rounded-full border-b border-outline-200 bg-background-50 p-2 px-4"
              space="md">
              <Text bold={true}>用户名</Text>
              <Text className="text-typography-400">{user.username}</Text>
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

export default UserEditScreen;
