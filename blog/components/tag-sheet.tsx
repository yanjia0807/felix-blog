import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import {
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { Text } from './ui/text';
import { Heading } from './ui/heading';
import { BottomSheetFlashList } from '@gorhom/bottom-sheet';
import { useFetchTags } from '@/api/tag';
import { Button, ButtonText } from './ui/button';
import _ from 'lodash';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Pressable } from './ui/pressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TagBtn from './tag-btn';
import { Controller, useForm } from 'react-hook-form';

const TagSheet = forwardRef(function TagSheet({ value, onChange }: any, ref: any) {
  const [selectedTags, setSelectedTags] = useState<any>([]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
  } = useForm({});

  const { data: tags, error, isError, isLoading, refetch } = useFetchTags(getValues());
  const { bottom: bottomSafeArea } = useSafeAreaInsets();
  const snapPoints = ['50%'];

  const onSubmit = useCallback((data: any) => refetch(data), [refetch]);

  const debouncedSubmit = React.useMemo(
    () => _.debounce(handleSubmit(onSubmit), 1000),
    [handleSubmit, onSubmit],
  );

  const addTag = (tag: any) => {
    setSelectedTags((prev: any) => [...prev, tag]);
  };

  const removeTag = (tag: any) => {
    setSelectedTags((prev: any) => _.reject(prev, ['id', tag.id]));
  };

  const cancel = useCallback(() => {
    setSelectedTags([...value]);
    ref.current?.dismiss();
  }, [ref, value]);

  const commitTag = useCallback(() => {
    onChange({ selectedTags });
    ref.current?.dismiss();
  }, [onChange, ref, selectedTags]);

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        disabled={_.some(selectedTags, ['id', item.id])}
        className="w-full justify-start border-secondary-50 py-2"
        onPress={() => addTag(item)}>
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
      <BottomSheetFooter {...props} bottomInset={bottomSafeArea}>
        <HStack className="flex-1 items-center justify-around">
          <Button onPress={() => cancel()}>
            <ButtonText>取消</ButtonText>
          </Button>
          <Button onPress={() => commitTag()} action="primary" variant="solid">
            <ButtonText>确定</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    ),
    [bottomSafeArea, cancel, commitTag],
  );

  useEffect(() => {
    setSelectedTags([...value]);
  }, [value]);

  return (
    <BottomSheetModal
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      footerComponent={(props) => renderFooter({ ...props })}
      keyboardBehavior="fillParent"
      ref={ref}>
      <BottomSheetView className="flex-1 px-4">
        <Heading size="xl" className="mb-4">
          标签
        </Heading>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <BottomSheetTextInput
              placeholder="搜索标签..."
              className="mb-4 w-full rounded-2xl border border-info-200 p-2"
              value={value}
              onChangeText={(e) => {
                onChange(e);
                debouncedSubmit();
              }}
            />
          )}
        />
        <HStack className="flex-wrap">
          {selectedTags.map((item: any) => (
            <TagBtn key={item.id} tag={item} removeTag={removeTag} />
          ))}
        </HStack>
        <BottomSheetFlashList
          data={tags}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          estimatedItemSize={35}
          showsVerticalScrollIndicator={false}
          extraData={{ selectedTags }}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default TagSheet;
