import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { BottomSheetFlashList } from '@gorhom/bottom-sheet';
import _ from 'lodash';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetchTags } from '@/api/tag';
import PostTags from './post-tags';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';

const PostTagSheet = forwardRef(function TagSheet({ value, onChange }: any, ref: any) {
  const [selectedTags, setSelectedTags] = useState<any>([]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    getValues,
  } = useForm({});

  const { data: tags, error, isError, isLoading, refetch } = useFetchTags(getValues());
  const insets = useSafeAreaInsets();
  const onSubmit = useCallback((data: any) => refetch(data), [refetch]);
  const debouncedSubmit = React.useMemo(
    () => _.debounce(handleSubmit(onSubmit), 1000),
    [handleSubmit, onSubmit],
  );

  const addTag = (tag: any) => {
    setSelectedTags((prev: any) => [...prev, tag]);
  };

  const onRemoveTag = (tag: any) => {
    setSelectedTags((prev: any) => _.reject(prev, ['id', tag.id]));
  };

  const cancel = useCallback(() => {
    setSelectedTags([...value]);
    ref.current?.close();
  }, [ref, value]);

  const commitTag = useCallback(() => {
    onChange({ selectedTags });
    ref.current?.close();
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
      <BottomSheetFooter {...props}>
        <HStack className="bg-gray-50 p-2 flex-1 items-center justify-around">
          <Button className="flex-1" variant="link" onPress={() => cancel()}>
            <ButtonText>取消</ButtonText>
          </Button>
          <Divider orientation="vertical"></Divider>
          <Button className="flex-1" variant="link" onPress={() => commitTag()} action="primary">
            <ButtonText>确定</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    ),
    [cancel, commitTag],
  );

  useEffect(() => {
    setSelectedTags([...value]);
  }, [value]);

  return (
    <BottomSheet
      snapPoints={['50%', '80%']}
      index={-1}
      backdropComponent={renderBackdrop}
      topInset={insets.top}
      bottomInset={insets.bottom}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      footerComponent={(props) => renderFooter({ ...props })}
      keyboardBehavior="fillParent"
      ref={ref}>
      <BottomSheetView className="flex-1 m-4">
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <BottomSheetTextInput
              placeholder="搜索标签..."
              className="my-2 w-full rounded-2xl border border-gray-100 bg-gray-100 p-3 focus:border-primary-700"
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

export default PostTagSheet;
