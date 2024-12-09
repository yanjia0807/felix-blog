import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { forwardRef, memo, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { fetchTags } from '@/api/tag';
import PostTags from './post-tags';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetFlatList,
} from './ui/actionsheet';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { HStack } from './ui/hstack';
import { Input, InputField } from './ui/input';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

const PostTagSheet = forwardRef(function TagSheet(
  { value, onChange, isOpen, onClose }: any,
  ref: any,
) {
  const [selectedTags, setSelectedTags] = useState<any>([]);
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

  const onCommitTag = useCallback(() => {
    onChange({ selectedTags });
    onClose();
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

  const onOpen = () => {
    if (!_.isEqual(selectedTags, value)) {
      setSelectedTags([...value]);
    }
  }

  return (
    <Actionsheet isOpen={isOpen} onOpen={onOpen} onClose={onClose} snapPoints={[80]}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="h-full">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <VStack className="flex-1 justify-between">
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input className="my-2 w-full rounded-2xl border p-3">
                <InputField
                  placeholder="搜索标签..."
                  value={value}
                  onChangeText={(e) => {
                    onChange(e);
                    debouncedSubmit();
                  }}
                />
              </Input>
            )}
          />
          <PostTags tags={selectedTags} onRemoveTag={onRemoveTag} />
          <ActionsheetFlatList
            data={tags}
            renderItem={renderItem}
            keyExtractor={(item: any) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            extraData={{ selectedTags }}
          />
          <HStack className="items-center justify-around p-2">
            <Button
              className="flex-1"
              variant="link"
              onPress={() => {
                setSelectedTags([...value]);
                onClose();
              }}>
              <ButtonText>取消</ButtonText>
            </Button>
            <Divider orientation="vertical"></Divider>
            <Button className="flex-1" onPress={() => onCommitTag()} action="positive">
              <ButtonText>确定</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
});

export default memo(PostTagSheet);
