import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchTags } from '@/api/tag';
import PostTags from './post-tags';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Input } from './ui/input';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const PostTagSheet = forwardRef(function TagSheet({ value, onChange }: any, ref: any) {
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const insets = useSafeAreaInsets();

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
  } = useForm({});

  const {
    data: tags,
    error,
    isError,
    isSuccess,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tags', { name: getValues() }],
    queryFn: () => fetchTags(getValues()),
  });

  const onSubmit = useCallback((data: any) => refetch(data), [refetch]);

  const debouncedSubmit = React.useMemo(
    () => _.debounce(handleSubmit(onSubmit), 1000),
    [handleSubmit, onSubmit],
  );

  const onAddTag = (tag: any) => {
    setSelectedTags((prev: any) => [...prev, tag]);
  };

  const onRemoveTag = (tag: any) => {
    setSelectedTags((prev: any) => _.reject(prev, ['id', tag.id]));
  };

  const onCommitBtnPressed = useCallback(() => {
    onChange({ selectedTags });
    ref.current?.close();
  }, [onChange, ref, selectedTags]);

  const onCloseBtnPressed = () => {
    setSelectedTags([...value]);
    ref.current?.close();
  };

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        disabled={_.some(selectedTags, ['id', item.id])}
        className="w-full justify-start py-2"
        onPress={() => onAddTag(item)}>
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
      <BottomSheetFooter {...props} bottomInset={insets.bottom} style={{ paddingHorizontal: 16 }}>
        <HStack className="items-center justify-around p-2">
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
    <Input className="bg-primary-100" variant="rounded">
      <BottomSheetTextInput
        inputMode="text"
        className="py-auto ios:leading-[0px] h-full flex-1 px-3 text-typography-900 placeholder:text-typography-500"
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
  );

  return (
    <BottomSheet
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      index={-1}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4">
        {isError && (
          <Box className="items-center">
            <Text>{error.message}</Text>
          </Box>
        )}
        {isSuccess && (
          <>
            <Controller name="name" control={control} render={renderInput} />
            <PostTags tags={selectedTags} onRemoveTag={onRemoveTag} />
            <BottomSheetFlatList
              data={tags}
              renderItem={renderItem}
              keyExtractor={(item: any) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              extraData={{ selectedTags }}
            />
          </>
        )}
      </VStack>
    </BottomSheet>
  );
});

export default PostTagSheet;
