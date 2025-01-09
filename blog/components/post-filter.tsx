import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { AlertCircle, Filter } from 'lucide-react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { fetchPosts } from '@/api';
import { DateInput } from './date-input';
import { TagSelect } from './tag-input';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from './ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from './ui/form-control';
import { HStack } from './ui/hstack';
import { Input, InputField } from './ui/input';
import { Switch } from './ui/switch';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

interface PostFilterDrawerContextType {
  isDrawerOpen: boolean;
  setIsDrawerOpen: any;
  filters: any;
  setFilters: any;
  clearFilters: any;
  data: any;
  fetchNextPage: any;
  hasNextPage: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  refetch: any;
}

export const PostFilterDrawerContext = createContext<PostFilterDrawerContextType>({
  isDrawerOpen: false,
  setIsDrawerOpen: undefined,
  filters: undefined,
  setFilters: undefined,
  clearFilters: undefined,
  data: undefined,
  fetchNextPage: undefined,
  hasNextPage: false,
  isLoading: false,
  isFetchingNextPage: false,
  refetch: undefined,
});

export const PostFilterDrawerProvider = ({ children }: any) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const defaultValues = {
    title: undefined,
    authorName: undefined,
    createdAtFrom: undefined,
    createdAtTo: undefined,
    isIncludeImage: false,
    isIncludeRecording: false,
    tags: [],
  };

  const [filters, setFilters] = useState<any>(defaultValues);

  const clearFilters = () => setFilters(defaultValues);

  const { data, error, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', 'list', filters],
      queryFn: fetchPosts,
      initialPageParam: {
        filters,
        pagination: {
          page: 1,
          pageSize: 10,
        },
      },
      getNextPageParam: (lastPage: any) => {
        const {
          meta: {
            filters,
            pagination: { page, pageSize, pageCount },
          },
        } = lastPage;

        if (page < pageCount) {
          return {
            filters,
            pagination: { page: page + 1, pageSize },
          };
        }

        return null;
      },
    });

  return (
    <PostFilterDrawerContext.Provider
      value={{
        isDrawerOpen,
        setIsDrawerOpen,
        filters,
        setFilters,
        clearFilters,
        data,
        fetchNextPage,
        hasNextPage,
        isLoading,
        isFetchingNextPage,
        refetch,
      }}>
      {children}
    </PostFilterDrawerContext.Provider>
  );
};

export const usePostFilterDrawerContext = () => useContext(PostFilterDrawerContext);

export const PostFilter = () => {
  const { setIsDrawerOpen } = usePostFilterDrawerContext();

  return (
    <Button
      variant="link"
      action="secondary"
      onPress={() => setIsDrawerOpen((prev: boolean) => !prev)}>
      <ButtonIcon as={Filter} size="xl" />
    </Button>
  );
};

type PostFilterSchema = z.infer<typeof postFilterSchema>;

const postFilterSchema = z.object({
  title: z.string().optional(),
  authorName: z.string().optional(),
  createdAtFrom: z.date().optional(),
  createdAtTo: z.date().optional(),
  isIncludeImage: z.boolean(),
  isIncludeRecording: z.boolean(),
  tags: z.array(z.any()),
});

export const PostFilterContent = () => {
  const { filters, setFilters, clearFilters, isLoading, setIsDrawerOpen } =
    usePostFilterDrawerContext();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<PostFilterSchema>({
    resolver: zodResolver(postFilterSchema),
    defaultValues: filters,
  });

  useEffect(() => {
    setValue('tags', filters.tags);
  }, [filters, setValue]);

  const renderTitle = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.title}>
        <Input variant="underlined">
          <InputField
            type="text"
            value={value}
            autoCapitalize="none"
            inputMode="text"
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
            autoCapitalize="none"
            inputMode="text"
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
      <FormControl isInvalid={!!errors.createdAtFrom} className="flex-1">
        <DateInput
          value={value}
          onChange={onChange}
          defaultDate={new Date()}
          placeholder="开始日期...."
          variant="underlined"
          className="flex-1"
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.createdAtFrom?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderCreatedAtTo = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.createdAtTo} className="flex-1">
        <DateInput
          value={value}
          onChange={onChange}
          placeholder="结束日期...."
          defaultDate={new Date()}
          variant="underlined"
          className="flex-1"
        />
        <FormControlError>
          <FormControlErrorIcon as={AlertCircle} />
          <FormControlErrorText>{errors?.createdAtTo?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    );
  };

  const renderIsIncludeImage = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.isIncludeImage}>
        <HStack space="md">
          <FormControlLabel>
            <FormControlLabelText>包含图片</FormControlLabelText>
          </FormControlLabel>
          <Switch size="md" value={value} onValueChange={onChange} />
          <FormControlError>
            <FormControlErrorIcon as={AlertCircle} />
            <FormControlErrorText>{errors?.isIncludeImage?.message}</FormControlErrorText>
          </FormControlError>
        </HStack>
      </FormControl>
    );
  };

  const renderIsIncludeRecording = ({ field: { onChange, onBlur, value } }: any) => {
    return (
      <FormControl isInvalid={!!errors.isIncludeRecording}>
        <HStack space="md">
          <FormControlLabel>
            <FormControlLabelText>包含录音</FormControlLabelText>
          </FormControlLabel>
          <Switch size="md" value={value} onValueChange={onChange} />
          <FormControlError>
            <FormControlErrorIcon as={AlertCircle} />
            <FormControlErrorText>{errors?.isIncludeRecording?.message}</FormControlErrorText>
          </FormControlError>
        </HStack>
      </FormControl>
    );
  };

  const renderTags = ({ field: { onChange, onBlur, value } }: any) => {
    const onClearBtnPress = () => onChange([]);

    return (
      <FormControl isInvalid={!!errors.isIncludeRecording}>
        <VStack space="md">
          <HStack className="justify-between">
            <FormControlLabel>
              <FormControlLabelText>标签</FormControlLabelText>
            </FormControlLabel>
            <HStack>
              <Button variant="link" size="sm" onPress={() => onClearBtnPress()}>
                <ButtonText>清空</ButtonText>
              </Button>
            </HStack>
          </HStack>
          <TagSelect value={value} onChange={onChange} />
          <FormControlError>
            <FormControlErrorIcon as={AlertCircle} />
            <FormControlErrorText>{errors?.isIncludeRecording?.message}</FormControlErrorText>
          </FormControlError>
        </VStack>
      </FormControl>
    );
  };

  const onSubmit = (data: any) => {
    setFilters({ ...data });
    setIsDrawerOpen(false);
  };

  const onClearFilterBtnPress = () => {
    clearFilters();
    reset();
  };

  return (
    <VStack className="flex-1 bg-background-100 p-4">
      <KeyboardAwareScrollView className="flex-1">
        <VStack className="flex-1" space="lg">
          <Controller name="title" control={control} render={renderTitle} />
          <Controller name="authorName" control={control} render={renderAuthorName} />
          <HStack className="items-center" space="lg">
            <Controller name="createdAtFrom" control={control} render={renderCreatedAtFrom} />
            <Text>--</Text>
            <Controller name="createdAtTo" control={control} render={renderCreatedAtTo} />
          </HStack>
          <Controller name="isIncludeImage" control={control} render={renderIsIncludeImage} />
          <Controller
            name="isIncludeRecording"
            control={control}
            render={renderIsIncludeRecording}
          />
          <Controller name="tags" control={control} render={renderTags} />
          <Button
            disabled={isLoading}
            action="primary"
            className="mt-8 rounded-full"
            onPress={handleSubmit(onSubmit)}>
            <ButtonText>搜索</ButtonText>
            {isLoading && <ButtonSpinner />}
          </Button>
          <Button variant="link" disabled={isLoading} onPress={() => onClearFilterBtnPress()}>
            <ButtonText>清空</ButtonText>
            {isLoading && <ButtonSpinner />}
          </Button>
        </VStack>
      </KeyboardAwareScrollView>
    </VStack>
  );
};
