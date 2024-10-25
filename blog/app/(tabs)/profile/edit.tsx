import { Keyboard, ScrollView } from "react-native";
import React, { useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
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
  PhoneOutgoingIcon,
  ChevronDownIcon,
  AlertCircle,
  EditIcon,
} from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Pressable } from "@/components/ui/pressable";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type userSchemaDetails = z.infer<typeof userSchema>;

const userSchema = z.object({
  gender: z.enum(["男", "女", "其他"]),
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone number must be a valid international phone number"
    ),
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

  const handleKeyPress = () => {
    Keyboard.dismiss();
  };
  
  const onSubmit = (_data: userSchemaDetails) => {
    reset();
  };

  return (
    <VStack className="h-full w-full mb-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
          flexGrow: 1,
        }}
      >
        <VStack className="h-full w-full pb-8" space="2xl">
          <Pressable className="absolute bg-background-500 rounded-full items-center justify-center h-8 w-8 right-6 top-44">
            <Icon as={EditIcon} />
          </Pressable>
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
          <VStack className="mx-6 mt-[240px]" space="2xl">
            <HStack className="items-center justify-between">
              <FormControl className="w-[47%]" isInvalid={!!errors.gender}>
                <FormControlLabel className="mb-2">
                  <FormControlLabelText>性别</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  name="gender"
                  control={control}
                  rules={{
                    validate: async (value: any) => {
                      try {
                        await userSchema.parseAsync({ city: value });
                        return true;
                      } catch (error: any) {
                        return error.message;
                      }
                    },
                  }}
                  render={({ field: { onChange, value } }: any) => (
                    <Select onValueChange={onChange} selectedValue={value}>
                      <SelectTrigger variant="outline" size="md">
                        <SelectInput placeholder="Select" />
                        <SelectIcon className="mr-3" as={ChevronDownIcon} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectItem label="Male" value="male" />
                          <SelectItem label="Female" value="female" />
                          <SelectItem label="Others" value="others" />
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  )}
                />
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircle} size="md" />
                  <FormControlErrorText>
                    {errors?.gender?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
              <FormControl className="w-[47%]" isInvalid={!!errors.phoneNumber}>
                <FormControlLabel className="mb-2">
                  <FormControlLabelText>电话</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  name="phoneNumber"
                  control={control}
                  rules={{
                    validate: async (value: any) => {
                      try {
                        await userSchema.parseAsync({ phoneNumber: value });
                        return true;
                      } catch (error: any) {
                        return error.message;
                      }
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }: any) => (
                    <Input className="flex-1">
                      <InputField
                        placeholder="89867292632"
                        type="text"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="number-pad"
                        onBlur={onBlur}
                        onSubmitEditing={handleKeyPress}
                        returnKeyType="done"
                      />
                    </Input>
                  )}
                />
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircle} size="md" />
                  <FormControlErrorText>
                    {errors?.phoneNumber?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
            </HStack>
            <Button
              onPress={() => {
                handleSubmit(onSubmit)();
              }}
              className="flex-1 p-2"
            >
              <ButtonText>保存</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
};

export default ProfileEdit;
