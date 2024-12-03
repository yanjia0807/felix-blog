import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import _ from 'lodash';
import { CameraIcon, ChevronDownIcon, AlertCircle, AlertCircleIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { UserData, updateUser } from '@/api';
import { useAuth } from '@/components/auth-context';
import { DatePicker } from '@/components/date-picker';
import { Avatar, AvatarImage, AvatarBadge } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
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
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';
import { genderEnum } from '@/constants/enum';

const ProfileEdit = () => {
  const { user }: any = useAuth();
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const insets = useSafeAreaInsets();
  const profile = { ...user.profile };

  type ProfileSchemaDetails = z.infer<typeof profileSchema>;

  const profileSchema = z.object({
    bio: z.string(),
    gender: z.string({
      required_error: '性别是必填项',
    }),
    birthday: z.date({
      required_error: '出生日期是必填项',
      invalid_type_error: '出生日期格式不正确',
    }),
    phoneNumber: z
      .string({
        required_error: '电话号码是必填项',
      })
      .regex(/^1[3-9]\d{9}$/, '电话号码格式不正确'),
  });

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<ProfileSchemaDetails>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: profile.bio,
      gender: profile.gender,
      birthday: profile.birthday ? new Date(profile.birthday) : new Date(),
      phoneNumber: profile.phoneNumber,
    },
  });

  const { isSuccess, isError, isPending, mutate } = useMutation({
    mutationFn: ({ documentId, profile }: { documentId: string; profile: UserData }) => {
      return updateUser({ documentId, profile });
    },
    onSuccess: () => {},
  });

  const renderBio = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl size="lg" isInvalid={!!errors.bio}>
      <FormControlLabel>
        <FormControlLabelText>我的签名</FormControlLabelText>
      </FormControlLabel>
      <Textarea className="flex-1 border-0 border-b">
        <TextareaInput
          placeholder="签名...."
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
    <FormControl isInvalid={!!errors.gender} size="lg">
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
        <FormControlErrorIcon as={AlertCircle} size="lg" />
        <FormControlErrorText>{errors?.gender?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderBirthday = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.birthday} size="lg">
      <FormControlLabel>
        <FormControlLabelText>出生日期</FormControlLabelText>
      </FormControlLabel>
      <DatePicker value={value} onChange={onChange} variant="rounded"></DatePicker>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{errors?.birthday?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderPhonNumber = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.phoneNumber} size="lg">
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
        />
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{errors?.phoneNumber?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const onSubmit = (data: ProfileSchemaDetails) => {
    mutate(
      {
        documentId: profile.documentId,
        profile: profile.documentId ? data : { ...data, user: user.documentId },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['user'] });
          toast.success({ title: '操作完成', description: '您的资料已更新' });
          router.navigate('/profile');
        },
        onError(error, variables, context) {
          toast.error(error.message);
        },
      },
    );
  };

  const renderHeaderLeft = () => (
    <Button
      size="md"
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
        contentContainerStyle={{
          paddingHorizontal: 24,
          backgroundColor: 'white',
        }}
        bottomOffset={30}
        showsVerticalScrollIndicator={false}>
        <VStack className="flex-1" space="lg">
          <Box className="h-52">
            <Center className="absolute top-16 w-full">
              <Avatar size="2xl">
                <AvatarImage source={require('@/assets/images/profile/image.png')} />
                <AvatarBadge className="items-center justify-center bg-background-500">
                  <Icon as={CameraIcon} />
                </AvatarBadge>
              </Avatar>
            </Center>
          </Box>
          <VStack className="flex-1" space="lg">
            <FormControl size="lg" isDisabled={true}>
              <FormControlLabel>
                <FormControlLabelText>邮箱地址</FormControlLabelText>
              </FormControlLabel>
              <Input variant="underlined">
                <InputField inputMode="email" autoCapitalize="none" value={user.email} />
              </Input>
            </FormControl>
            <FormControl size="lg" isDisabled={true}>
              <FormControlLabel>
                <FormControlLabelText>用户名</FormControlLabelText>
              </FormControlLabel>
              <Input variant="underlined" className="mb-2">
                <InputField inputMode="text" autoCapitalize="none" value={user.username} />
              </Input>
            </FormControl>
            <Controller name="bio" control={control} render={renderBio} />
            <Controller name="gender" control={control} render={renderGender} />
            <Controller name="birthday" control={control} render={renderBirthday} />
            <Controller name="phoneNumber" control={control} render={renderPhonNumber} />
            <Button action="primary" size="lg" onPress={handleSubmit(onSubmit)}>
              <ButtonText>保存</ButtonText>
              {isPending && <ButtonSpinner />}
            </Button>
          </VStack>
        </VStack>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ProfileEdit;
