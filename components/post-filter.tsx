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
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
      <ButtonIcon as={Filter} className="text-tertiary-500" />
    </Button>
  );
};

export const ResetFilterIcon = () => {
  const { clearFilterTags } = usePostFilterContext();

  return (
    <Button variant="link" action="secondary" onPress={() => clearFilterTags()}>
      <ButtonIcon as={Eraser} className="text-tertiary-500" />
    </Button>
  );
};

const postFilterSchema = z.object({
  title: z.string().optional(),
  authorName: z.string().optional(),
  createdAtFrom: z.date().optional(),
  createdAtTo: z.date().optional(),
  tags: z.array(z.any()),
});

type PostFilterSchema = z.infer<typeof postFilterSchema>;

export const PostFilterContent = () => {
  const { filters, setFilters, setIsDrawerOpen, isDrawerOpen } = usePostFilterContext();
  const insets = useSafeAreaInsets();

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
          placeholder="发布日期"
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
          placeholder="发布日期"
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

  const onSubmit = (data: any) => {
    setIsDrawerOpen(false);
    setFilters({ ...data });
  };

  const onClearFilterBtnPress = () => {
    reset();
  };

  return (
    <VStack className="flex-1 bg-background-50 px-4" style={{ paddingTop: insets.top }}>
      <KeyboardAwareScrollView className="flex-1">
        <VStack className="flex-1" space="lg">
          <Controller name="title" control={control} render={renderTitle} />
          <Controller name="authorName" control={control} render={renderAuthorName} />
          <HStack className="items-center" space="lg">
            <Controller name="createdAtFrom" control={control} render={renderCreatedAtFrom} />
            <Text>--</Text>
            <Controller name="createdAtTo" control={control} render={renderCreatedAtTo} />
          </HStack>
          <Controller name="tags" control={control} render={renderTags} />
          <VStack className="mt-8" space="md">
            <Button action="positive" onPress={handleSubmit(onSubmit)}>
              <ButtonText>搜索</ButtonText>
            </Button>
            <Button action="negative" onPress={() => onClearFilterBtnPress()}>
              <ButtonText>重置</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </KeyboardAwareScrollView>
    </VStack>
  );
};
