import React, { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
  useBottomSheetInternal,
} from '@gorhom/bottom-sheet';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Search, Tag } from 'lucide-react-native';
import {
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';
import { fetchPopularPageTags, fetchPopularTags } from '@/api/tag';
import useDebounce from '@/hooks/use-debounce';
import { Button, ButtonText } from './ui/button';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from './ui/input';
import { Pressable } from './ui/pressable';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
import { Card } from './ui/card';

export const TagSelect = ({ value = [], onChange }: any) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [moreTags, setMoreTags] = useState<any>([]);

  const { data: tags } = useQuery({
    queryKey: ['tags', 'list', 'popular'],
    queryFn: () => fetchPopularTags({ limit: 2 }),
  });
  const allTags = _.unionBy(tags, moreTags, 'id');

  const onTagItemPress = (item: any) => {
    if (_.find(value, (val) => val.id === item.id)) {
      onChange(_.filter(value, (val: any) => val.id !== item.id));
    } else {
      onChange([...value, item]);
    }
  };

  const onShowMore = () => bottomSheetRef.current?.present();

  const onMoreChange = (moreValue: any) => {
    setMoreTags(moreValue);
    onChange(moreValue);
  };

  const onRemoveAll = () => {
    setMoreTags([]);
    onChange([]);
  };

  return (
    <>
      <HStack space="sm" className="flex-wrap">
        {allTags?.map((item: any) => (
          <Button
            onPress={() => onTagItemPress(item)}
            key={item.id}
            size="sm"
            action={_.find(value, (val) => val.id === item.id) ? 'primary' : 'secondary'}
            variant="solid">
            <ButtonText>{item.name}</ButtonText>
          </Button>
        ))}
        <Button
          onPress={onShowMore}
          key={-1}
          size="sm"
          action="secondary"
          variant="link"
          className="ml-3">
          <ButtonText>更多...</ButtonText>
        </Button>
        <Button
          onPress={onRemoveAll}
          key={-2}
          size="sm"
          action="secondary"
          variant="link"
          className="ml-3">
          <ButtonText>清空</ButtonText>
        </Button>
      </HStack>
      <TagSheet ref={bottomSheetRef} onChange={onMoreChange} value={value} />
    </>
  );
};

export const TagList = ({ value = [], onChange, className, readonly = false }: any) => {
  const onRemove = (id: any) => {
    onChange(_.filter(value, (item: any) => item.id !== id));
  };

  const onRemoveAll = (id: any) => {
    onChange([]);
  };

  if (value?.length > 0) {
    return (
      <HStack space="sm" className={twMerge('flex-wrap', className)}>
        {value.map((item: any) => (
          <Button
            size="sm"
            action="secondary"
            onPress={() => !readonly && onRemove(item.id)}
            key={item.id}>
            <ButtonText>{item.name}</ButtonText>
          </Button>
        ))}
        <Button
          onPress={onRemoveAll}
          key={0}
          size="sm"
          action="secondary"
          variant="link"
          className="ml-3">
          <ButtonText>清空</ButtonText>
        </Button>
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
          autoCorrect={false}
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

  useEffect(() => {
    setSelectedTags([...value]);
  }, [value]);

  const tagsQuery = useInfiniteQuery({
    queryKey: ['tags', 'list', debounceKeywords],
    queryFn: fetchPopularPageTags,
    placeholderData: (prev) => prev,
    initialPageParam: {
      keywords: debounceKeywords,
      pagination: {
        page: 1,
        pageSize: 20,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { page, pageSize, pageCount },
        },
      } = lastPage;

      if (page < pageCount) {
        return {
          keywords: debounceKeywords,
          pagination: { page: page + 1, pageSize },
        };
      }
      return null;
    },
  });

  const tags = tagsQuery.isSuccess
    ? _.reduce(tagsQuery.data?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : [];

  const onAdd = (tag: any) => {
    setSelectedTags((prev: any) => [...prev, tag]);
  };

  const onCommit = () => {
    onChange(selectedTags);
    ref.current?.close();
  };

  const onClose = () => {
    setSelectedTags([...value]);
    ref.current?.close();
  };

  const renderSeparatorComponent = () => <Divider />;

  const renderItem = ({ item }: any) => {
    return (
      <Pressable
        disabled={_.find(selectedTags, (val) => val.id === item.id)}
        onPress={() => onAdd(item)}>
        <Card size="sm" variant="ghost">
          <Text className="w-full">{item.name}</Text>
        </Card>
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
          <Button action="negative" variant="link" className="flex-1" onPress={() => onClose()}>
            <ButtonText>取消</ButtonText>
          </Button>
          <Divider orientation="vertical" />
          <Button action="positive" variant="link" className="flex-1" onPress={() => onCommit()}>
            <ButtonText>确定</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    );
  };

  const renderEmptyComponent = (props: any) => {
    return (
      <View className="mt-32 w-full flex-1 items-center">
        <Text size="sm">没有数据</Text>
      </View>
    );
  };

  const onTagChange = (value: any) => setSelectedTags(value);

  const onEndReached = () => {
    if (tagsQuery.hasNextPage && !tagsQuery.isFetchingNextPage) {
      tagsQuery.fetchNextPage();
    }
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
        <Heading className="self-center">请选择标签</Heading>
        <HStack className="bg-background-100">
          <TagSearchInput
            ref={inputRef}
            value={keywords}
            onChange={(text: any) => setKeywords(text)}
            isLoading={tagsQuery.isLoading}
          />
        </HStack>
        <TagList value={selectedTags} onChange={onTagChange} />
        <BottomSheetFlatList
          data={tags}
          keyExtractor={(item: any) => item.documentId}
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={renderSeparatorComponent}
          showsVerticalScrollIndicator={false}
          extraData={{ selectedTags }}
          onEndReached={onEndReached}
        />
      </VStack>
    </BottomSheetModal>
  );
});
