import { fetchPopularPageTags } from '@/api/tag';
import { ListEmptyView } from '@/components/list-empty-view';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useDebounce from '@/hooks/use-debounce';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { useInfiniteQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TagList } from './tag-list';
import { TagSearchInput } from './tag-search-input';

export const TagSheet = forwardRef(function Sheet({ value = [], onChange }: any, ref: any) {
  const [keywords, setKeywords] = useState(undefined);
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const snapPoints = useMemo(() => ['80%'], []);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<any>(null);
  const debounceKeywords = useDebounce(keywords, 500);

  useEffect(() => {
    setSelectedTags((prev) => {
      return _.isEqual(value, prev) ? prev : [...value];
    });
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
          <Button action="positive" className="flex-1" onPress={() => onCommit()}>
            <ButtonText>确定</ButtonText>
          </Button>
        </HStack>
      </BottomSheetFooter>
    );
  };

  const renderEmptyComponent = () => <ListEmptyView />;

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
      <VStack className="flex-1 bg-background-100 p-2" space="md">
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
