import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Tag, X } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';
import { fetchTags } from '@/api/tag';
import PageSpinner from './page-spinner';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { FormControl } from './ui/form-control';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Input, InputIcon } from './ui/input';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

export const TagSelect = ({ value = [], onChange }: any) => {
  const { data: tags } = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchTags,
  });

  const onTagItemPress = (item: any) => {
    if (_.includes(value, item.id)) {
      onChange(_.filter(value, (val: any) => val !== item.id));
    } else {
      onChange([...value, item.id]);
    }
  };

  return (
    <HStack space="sm" className="flex-wrap">
      {tags?.map((item: any) => (
        <Button
          onPress={() => onTagItemPress(item)}
          key={item.id}
          size="sm"
          action="secondary"
          variant={_.includes(value, item.id) ? 'solid' : 'outline'}>
          <ButtonText>{item.name}</ButtonText>
        </Button>
      ))}
    </HStack>
  );
};

export const TagList = ({ value = [], onChange, className, readonly = false }: any) => {
  const onRemove = (documentId: any) => {
    onChange(_.filter(value, (item: any) => item.documentId !== documentId));
  };

  if (value?.length > 0) {
    return (
      <HStack space="sm" className={twMerge('flex-wrap', className)}>
        {value.map((item: any) => (
          <Button
            size="xs"
            action="secondary"
            onPress={() => !readonly && onRemove(item.documentId)}
            key={item.documentId}>
            <ButtonText>{item.name}</ButtonText>
          </Button>
        ))}
      </HStack>
    );
  }
};

export const TagInput = ({ value, onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const onInputIconPressed = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <>
      <Pressable onPress={() => onInputIconPressed()}>
        <InputIcon as={Tag}></InputIcon>
      </Pressable>
      <TagSheet onChange={onChange} value={value} ref={bottomSheetRef} />
    </>
  );
};

type FilterFormSchema = z.infer<typeof filterFormSchema>;

const filterFormSchema = z.object({
  name: z.string().max(100, '内容不能超过100个字符').nullable(),
});

export const TagSheet = forwardRef(function Sheet({ value = [], onChange }: any, ref: any) {
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const snapPoints = useMemo(() => ['80%'], []);
  const insets = useSafeAreaInsets();

  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<FilterFormSchema>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    setSelectedTags([...value]);
  }, [value]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tags', { name: getValues() }],
    queryFn: () => fetchTags(getValues()),
  });

  const onSubmit = useCallback((data: any) => refetch(data), [refetch]);

  const debouncedSubmit = React.useMemo(
    () => _.debounce(handleSubmit(onSubmit), 1000),
    [handleSubmit, onSubmit],
  );

  const onAdd = (tag: any) => {
    setSelectedTags((prev: any) => [...prev, tag]);
  };

  const onCommitBtnPressed = () => {
    onChange(selectedTags);
    ref.current?.close();
  };

  const onCloseBtnPressed = () => {
    setSelectedTags([...value]);
    ref.current?.close();
  };

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        disabled={_.some(selectedTags, ['documentId', item.documentId])}
        className="w-full justify-start py-2"
        onPress={() => onAdd(item)}>
        <Text className="w-full">{item.name}</Text>
      </Pressable>
    );
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={'close'}
      />
    ),
    [],
  );

  const renderFooter = (props: any) => {
    return (
      <BottomSheetFooter {...props}>
        <HStack
          className="items-center justify-around bg-background-50 p-2"
          style={{ paddingBottom: insets.bottom }}>
          <Button className="flex-1" variant="link" onPress={() => onCloseBtnPressed()}>
            <ButtonText>取消</ButtonText>
          </Button>
          <Divider orientation="vertical"></Divider>
          <Button className="flex-1" onPress={() => onCommitBtnPressed()} action="positive">
            <ButtonText>确定</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    );
  };

  const renderInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl className="flex-1" isInvalid={!!errors.name} size="md">
      <Input className="bg-background-50" variant="rounded">
        <BottomSheetTextInput
          inputMode="text"
          className="h-full flex-1 px-3"
          returnKeyType="search"
          placeholder="搜索标签..."
          value={value}
          onBlur={onBlur}
          onChangeText={(e) => {
            onChange(e);
            debouncedSubmit();
          }}
        />
      </Input>
    </FormControl>
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <PageSpinner isVisiable={isLoading} />
        <VStack className="mb-4 items-center">
          <Heading className="p-2">请选择标签</Heading>
          <Divider />
        </VStack>
        <HStack className="bg-background-100">
          <Controller name="name" control={control} render={renderInput} />
        </HStack>
        <TagList value={selectedTags} onChange={onChange} />
        <BottomSheetFlatList
          data={data}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          extraData={{ selectedTags }}
        />
      </VStack>
    </BottomSheetModal>
  );
});
