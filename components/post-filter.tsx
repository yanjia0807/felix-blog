import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from 'lodash';
import { AlertCircle, Eraser, Filter } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { DateInput } from './date-input';
import { TagSelect } from './tag-input';
import { Button, ButtonIcon, ButtonText } from './ui/button';
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

interface FilterContextType {
  isDrawerOpen: boolean;
  setIsDrawerOpen: any;
  filters: any;
  setFilters: any;
  selectTag: any;
  clearFilterTags: any;
}

const defaultValues = {
  title: undefined,
  authorName: undefined,
  createdAtFrom: undefined,
  createdAtTo: undefined,
  isIncludeImage: false,
  isIncludeRecording: false,
  tags: [],
};

const FilterContext = createContext<FilterContextType>({} as any);
export const usePostFilterContext = () => useContext(FilterContext);

export const PostFilterProvider = ({ children }: any) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<any>(defaultValues);

  const selectTag = useCallback(
    ({ item }: any) => {
      if (_.includes(filters.tags, item.id)) {
        setFilters((val: any) => ({
          ...val,
          tags: _.filter([...filters.tags], (val: any) => val !== item.id),
        }));
      } else {
        setFilters((val: any) => ({
          ...val,
          tags: [...filters.tags, item.id],
        }));
      }
    },
    [filters.tags],
  );

  const clearFilterTags = useCallback(
    () =>
      setFilters((val: any) => ({
        ...val,
        tags: [],
      })),
    [],
  );

  const value = {
    isDrawerOpen,
    setIsDrawerOpen,
    filters,
    setFilters,
    selectTag,
    clearFilterTags,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const PostFilterIcon = () => {
  const { setIsDrawerOpen } = usePostFilterContext();

  return (
    <Button variant="link" action="secondary" onPress={() => setIsDrawerOpen(true)}>
      <ButtonIcon as={Filter} size="xl" />
    </Button>
  );
};

export const ResetFilterIcon = () => {
  const { clearFilterTags } = usePostFilterContext();

  return (
    <Button variant="link" action="secondary" onPress={() => clearFilterTags()}>
      <ButtonIcon as={Eraser} />
    </Button>
  );
};

const postFilterSchema = z.object({
  title: z.string().optional(),
  authorName: z.string().optional(),
  createdAtFrom: z.date().optional(),
  createdAtTo: z.date().optional(),
  isIncludeImage: z.boolean(),
  isIncludeRecording: z.boolean(),
  tags: z.array(z.any()),
});

type PostFilterSchema = z.infer<typeof postFilterSchema>;

export const PostFilterContent = () => {
  console.log('@@PostFilterContent');
  const { filters, setFilters, setIsDrawerOpen, isDrawerOpen } = usePostFilterContext();

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
  }, [filters.tags, setValue, isDrawerOpen]);

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
    return (
      <FormControl isInvalid={!!errors.isIncludeRecording}>
        <VStack space="md">
          <HStack className="justify-between">
            <FormControlLabel>
              <FormControlLabelText>标签</FormControlLabelText>
            </FormControlLabel>
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
    setIsDrawerOpen(false);
    setFilters({ ...data });
  };

  const onClearFilterBtnPress = () => {
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
          <Button action="primary" className="mt-8 rounded-full" onPress={handleSubmit(onSubmit)}>
            <ButtonText>搜索</ButtonText>
          </Button>
          <Button action="default" variant="link" onPress={() => onClearFilterBtnPress()}>
            <ButtonText>重置</ButtonText>
          </Button>
        </VStack>
      </KeyboardAwareScrollView>
    </VStack>
  );
};
