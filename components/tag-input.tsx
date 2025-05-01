import React, { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
  useBottomSheetInternal,
} from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Search, Tag } from 'lucide-react-native';
import { NativeSyntheticEvent, TextInputFocusEventData, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';
import { fetchAllTags } from '@/api/tag';
import useDebounce from '@/hooks/use-debounce';
import PageSpinner from './page-spinner';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

export const TagSelect = ({ value = [], onChange }: any) => {
  const { data: tags } = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchAllTags,
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
          action={_.includes(value, item.id) ? 'primary' : 'secondary'}
          variant="solid">
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
      <TouchableOpacity onPress={() => onInputIconPressed()}>
        <InputIcon as={Tag}></InputIcon>
      </TouchableOpacity>
      <TagSheet onChange={onChange} value={value} ref={bottomSheetRef} />
    </>
  );
};

export const TagSearchInput: React.FC<any> = memo(
  forwardRef<any, any>(({ onFocus, onBlur, onChange, value, isLoading }, ref) => {
    console.log('@render TagSearchInput');

    const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

    const handleOnFocus = useCallback(
      (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
        shouldHandleKeyboardEvents.value = true;
        if (onFocus) {
          onFocus(args);
        }
      },
      [onFocus, shouldHandleKeyboardEvents],
    );

    const handleOnBlur = useCallback(
      (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
        shouldHandleKeyboardEvents.value = false;
        if (onBlur) {
          onBlur(args);
        }
      },
      [onBlur, shouldHandleKeyboardEvents],
    );

    useEffect(() => {
      return () => {
        shouldHandleKeyboardEvents.value = false;
      };
    }, [shouldHandleKeyboardEvents]);

    return (
      <Input variant="rounded" className="w-full">
        <InputSlot className="ml-3">
          <InputIcon as={Search} />
        </InputSlot>
        <InputField
          ref={ref}
          inputMode="text"
          autoCapitalize="none"
          returnKeyType="send"
          placeholder="搜索标签..."
          value={value}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          onChangeText={onChange}
        />
        {isLoading && (
          <InputSlot className="mx-3">
            <InputIcon as={Spinner} />
          </InputSlot>
        )}
      </Input>
    );
  }),
);

export const TagSheet = forwardRef(function Sheet({ value = [], onChange }: any, ref: any) {
  const [keywords, setKeywords] = useState(undefined);
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const snapPoints = useMemo(() => ['80%'], []);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<any>(null);
  const debounceKeywords = useDebounce(keywords, 500);
  const filters = {
    keywords: debounceKeywords,
  };

  useEffect(() => {
    setSelectedTags([...value]);
  }, [value]);

  const { data, isLoading } = useQuery({
    queryKey: ['tags', 'list', filters],
    queryFn: () => fetchAllTags(filters),
    placeholderData: (prev) => prev,
  });

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
      <TouchableOpacity
        disabled={_.some(selectedTags, ['documentId', item.documentId])}
        className="w-full justify-start py-2"
        onPress={() => onAdd(item)}>
        <Text className="w-full">{item.name}</Text>
      </TouchableOpacity>
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

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}>
      <VStack className="flex-1 bg-background-100 p-4" space="md">
        <VStack className="mb-4 items-center">
          <Heading className="p-2">请选择标签</Heading>
          <Divider />
        </VStack>
        <HStack className="bg-background-100">
          <TagSearchInput
            ref={inputRef}
            value={keywords}
            onChange={(text: any) => setKeywords(text)}
            isLoading={isLoading}
          />
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
