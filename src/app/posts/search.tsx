import { ListEmptyView } from '@/components/list-empty-view';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useFetchPostOutlines } from '@/features/post/api/use-fetch-post-outlines';
import {
  PostDrawerProvider,
  usePostDrawerContext,
} from '@/features/post/components/post-drawer-provider';
import { PostFilter } from '@/features/post/components/post-filter';
import { PostFilterInput } from '@/features/post/components/post-filter-input';
import PostOutlineItem from '@/features/post/components/post-outline-item';
import { router } from 'expo-router';
import _ from 'lodash';
import React, { memo } from 'react';
import { FlatList, SafeAreaView } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const PostSearchHeader: React.FC<any> = ({ outlines, isLoading }) => {
  return (
    <VStack space="md">
      <HStack space="lg" className="w-full items-center justify-between">
        <Button action="secondary" variant="link" onPress={() => router.back()}>
          <ButtonText>返回</ButtonText>
        </Button>
        <PostFilterInput isLoading={isLoading} outlines={outlines} />
      </HStack>
      <Divider />
    </VStack>
  );
};

const PostSearchDrawer: React.FC<any> = () => {
  const { isOpen, open, close } = usePostDrawerContext();

  return (
    <Drawer
      open={isOpen}
      onOpen={open}
      onClose={close}
      drawerType="slide"
      swipeEnabled={false}
      renderDrawerContent={() => <PostFilter />}>
      <PostSearch />
    </Drawer>
  );
};

const PostSearch = memo(function PostSearch() {
  const outlinesQuery = useFetchPostOutlines();
  const outlines: any =
    outlinesQuery.status === 'success'
      ? _.reduce(
          outlinesQuery.data?.pages,
          (result: any, page: any) => [...result, ...page.data],
          [],
        )
      : [];

  const renderItem = ({ item }: any) => <PostOutlineItem item={item} />;

  const renderEmptyComponent = <ListEmptyView />;

  const renderItemSeparator = () => <Divider orientation="horizontal" />;

  const onEndReached = () => {
    if (outlinesQuery.hasNextPage && !outlinesQuery.isFetchingNextPage) {
      outlinesQuery.fetchNextPage();
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4" space="lg">
        <PostSearchHeader outlines={outlines} isLoading={outlinesQuery.isLoading} />
        <FlatList
          renderScrollComponent={(props) => (
            <KeyboardAwareScrollView {...props} showsVerticalScrollIndicator={false} />
          )}
          contentContainerClassName="flex-grow"
          data={outlines}
          keyExtractor={(item) => item.documentId}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={renderItemSeparator}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
        />
      </VStack>
    </SafeAreaView>
  );
});

const PostSearchPage: React.FC<any> = () => {
  return (
    <PostDrawerProvider>
      <PostSearchDrawer>
        <PostSearch />
      </PostSearchDrawer>
    </PostDrawerProvider>
  );
};

export default PostSearchPage;
