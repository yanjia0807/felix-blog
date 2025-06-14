import { DateInput } from '@/components/date-input';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { TagSelect } from '@/features/tag/components/tag-select';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react-native';
import React, { memo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { useFilters, usePostFilterActions } from '../store/use-post-filter-store';
import { usePostDrawerContext } from './post-drawer-provider';

const postFilterSchema = z.object({
  title: z.string(),
  authorName: z.string(),
  publishDateFrom: z.date().optional(),
  publishDateTo: z.date().optional(),
  tags: z.array(z.any()),
});

type PostFilterSchema = z.infer<typeof postFilterSchema>;

export const PostFilter = memo(function PostFilter() {
  const filters = useFilters();
  const { setFilters } = usePostFilterActions();
  const { close } = usePostDrawerContext();
  const insets = useSafeAreaInsets();

  const onSubmit = (data: any) => {
    setFilters(data);
    close();
  };

  const onReset = () => reset();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<PostFilterSchema>({
    resolver: zodResolver(postFilterSchema),
    defaultValues: filters,
  });

  const renderTitle = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.title}>
        <Input variant="underlined">
          <InputField
            type="text"
            value={value}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="标题...."
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.title?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderAuthorName = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.authorName}>
        <Input variant="underlined">
          <InputField
            type="text"
            value={value}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="作者...."
          />
        </Input>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.authorName?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderCreatedAtFrom = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.publishDateFrom} className="flex-1">
        <DateInput
          value={value}
          onChange={onChange}
          defaultDate={new Date()}
          placeholder="发布日期"
          variant="underlined"
          className="flex-1"
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.publishDateFrom?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderCreatedAtTo = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.publishDateTo} className="flex-1">
        <DateInput
          value={value}
          onChange={onChange}
          placeholder="发布日期"
          defaultDate={new Date()}
          variant="underlined"
          className="flex-1"
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.publishDateTo?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderTags = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.tags}>
        <TagSelect value={value} onChange={onChange} />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.tags?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  return (
    <VStack className="flex-1 bg-background-50 px-4" style={{ paddingTop: insets.top }}>
      <KeyboardAwareScrollView className="flex-1">
        <VStack className="flex-1" space="lg">
          <Controller name="title" control={control} render={renderTitle} />
          <Controller name="authorName" control={control} render={renderAuthorName} />
          <HStack className="items-center" space="lg">
            <Controller name="publishDateFrom" control={control} render={renderCreatedAtFrom} />
            <Text>--</Text>
            <Controller name="publishDateTo" control={control} render={renderCreatedAtTo} />
          </HStack>
          <Controller name="tags" control={control} render={renderTags} />
          <VStack className="mt-8" space="md">
            <Button action="positive" onPress={handleSubmit(onSubmit)}>
              <ButtonText>搜索</ButtonText>
            </Button>
            <Button action="negative" onPress={() => onReset()}>
              <ButtonText>重置</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </KeyboardAwareScrollView>
    </VStack>
  );
});
