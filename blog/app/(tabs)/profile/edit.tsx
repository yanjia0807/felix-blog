import React from "react";
import _ from "lodash";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Avatar, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
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
} from "@/components/ui/select";
import { VStack } from "@/components/ui/vstack";
import {
  CameraIcon,
  ChevronDownIcon,
  AlertCircle,
  AlertCircleIcon,
} from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { genderEnum } from "@/constants/enum";
import { DatePicker } from "@/components/DatePicker";
import { Box } from "@/components/ui/box";

type userSchemaDetails = z.infer<typeof userSchema>;

const userSchema = z.object({
  username: z
    .string({
      required_error: "用户名是必填项",
    })
    .min(3, "用户名长度需在3到16个字符之间")
    .max(16, "用户名长度需在3到16个字符之间"),
  gender: z.enum(_.map(genderEnum, "value"), {
    required_error: "性别是必填项",
    invalid_type_error: "性别格式不正确",
  }),
  birthday: z.date({
    required_error: "出生日期是必填项",
    invalid_type_error: "出生日期格式不正确",
  }),
  phoneNumber: z
    .string({
      required_error: "电话号码是必填项",
    })
    .regex(/^1[3-9]\d{9}$/, "电话号码格式不正确"),
});

const ProfileEdit = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<userSchemaDetails>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = (_data: userSchemaDetails) => {
    // reset();
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        paddingHorizontal: 32,
      }}
      bottomOffset={30}
    >
      <VStack className="flex-1" space="lg">
        <Box className="h-52">
          <Center className="w-full absolute top-16">
            <Avatar size="2xl">
              <AvatarImage
                source={require("@/assets/images/profile/image.png")}
              />
              <AvatarBadge className="justify-center items-center bg-background-500">
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
              <InputField
                inputMode="email"
                autoCapitalize="none"
                value="yanjiafelix@gmail.com"
              ></InputField>
            </Input>
            <FormControlError>
              <FormControlErrorText></FormControlErrorText>
            </FormControlError>
          </FormControl>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }: any) => (
              <FormControl isInvalid={!!errors.username} size="lg">
                <FormControlLabel>
                  <FormControlLabelText>用户名</FormControlLabelText>
                </FormControlLabel>
                <Input variant="rounded" className="mb-2">
                  <InputField
                    inputMode="text"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </Input>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {errors?.username?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field: { onChange, onBlur, value } }: any) => (
              <FormControl isInvalid={!!errors.gender} size="lg">
                <FormControlLabel>
                  <FormControlLabelText>性别</FormControlLabelText>
                </FormControlLabel>
                <Select onValueChange={onChange} selectedValue={value}>
                  <SelectTrigger variant="rounded">
                    <SelectInput className="flex-1"></SelectInput>
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
                  <FormControlErrorText>
                    {errors?.gender?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
          <Controller
            name="birthday"
            control={control}
            render={({ field: { onChange, onBlur, value } }: any) => (
              <FormControl isInvalid={!!errors.birthday} size="lg">
                <FormControlLabel>
                  <FormControlLabelText>出生日期</FormControlLabelText>
                </FormControlLabel>
                <DatePicker
                  value={value}
                  onChange={onChange}
                  variant="rounded"
                ></DatePicker>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircle} size="lg" />
                  <FormControlErrorText>
                    {errors?.birthday?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field: { onChange, onBlur, value } }: any) => (
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
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {errors?.phoneNumber?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}
          />
          <Button
            action="primary"
            size="lg"
            onPress={() => {
              handleSubmit(onSubmit)();
            }}
          >
            <ButtonText>保存</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </KeyboardAwareScrollView>
  );
};

export default ProfileEdit;
