import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BottomSheetFlashList } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchTags } from '@/api/tag';
import PostTags from './post-tags';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';

const PostTagSheet = forwardRef(function TagSheet({ value, onChange }: any, ref: any) {
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const snapPoints = useMemo(() => ['50%', '75%'], []);
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
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tags', { name: getValues() }],
    queryFn: () => fetchTags(getValues()),
  });

  const insets = useSafeAreaInsets();
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

  const onCancel = useCallback(() => {
    setSelectedTags([...value]);
    ref.current?.close();
  }, [ref, value]);

  const onCommitTag = useCallback(() => {
    onChange({ selectedTags });
    ref.current?.close();
  }, [onChange, ref, selectedTags]);

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        disabled={_.some(selectedTags, ['id', item.id])}
        className="w-full justify-start border-secondary-50 py-2"
        onPress={() => onAddTag(item)}>
        <Text className="w-full">{item.name}</Text>
      </Pressable>
    );
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        pressBehavior="none"
      />
    ),
    [],
  );

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props}>
        <HStack className="p-2 flex-1 items-center justify-around">
          <Button className="flex-1" variant="link" onPress={() => onCancel()}>
            <ButtonText>取消</ButtonText>
          </Button>
          <Divider orientation="vertical"></Divider>
          <Button className="flex-1" variant="link" onPress={() => onCommitTag()} action="primary">
            <ButtonText>确定</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    ),
    [onCancel, onCommitTag],
  );

  const onBottomSheetAnimate = (fromIndex: number, toIndex: number) => {
    if (fromIndex === -1) {
      if (!_.isEqual(selectedTags, value)) {
        setSelectedTags([...value]);
      }
    }
  };

  console.log('post-tag-sheet render', value);
  return (
    <BottomSheet
      snapPoints={snapPoints}
      index={-1}
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      enableOverDrag={false}
      footerComponent={renderFooter}
      keyboardBehavior="fillParent"
      ref={ref}
      onAnimate={onBottomSheetAnimate}>
      <BottomSheetView className="flex-1 p-4 bg-background-100">
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <BottomSheetTextInput
              placeholder="搜索标签..."
              className="my-2 w-full rounded-2xl border p-3"
              value={value}
              onChangeText={(e) => {
                onChange(e);
                debouncedSubmit();
              }}
            />
          )}
        />
        <PostTags tags={selectedTags} onRemoveTag={onRemoveTag} />
        <BottomSheetFlashList
          data={tags}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          estimatedItemSize={35}
          showsVerticalScrollIndicator={false}
          extraData={{ selectedTags }}
        />
      </BottomSheetView>
    </BottomSheet>
  );
});

export default memo(PostTagSheet);
