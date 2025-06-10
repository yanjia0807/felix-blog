import { MainHeader } from '@/components/header';
import { ListEmptyView } from '@/components/list-empty-view';
import { Card } from '@/components/ui/card';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { AnonyView } from '@/features/auth/components/anony';
import { useAuth } from '@/features/auth/components/auth-provider';
import { CommentSheet } from '@/features/comment/components/comment-sheet';
import { CommentSheetProvider } from '@/features/comment/components/comment-sheet-provider';
import { CarouselProvider } from '@/features/image/components/carousel-provider';
import CarouselViewer from '@/features/image/components/carousel-viewer';
import { useFetchPosts } from '@/features/post/api/use-fetch-posts';
import { Banner } from '@/features/post/components/banner';
import { PostItem } from '@/features/post/components/post-item';
import { PostListSkeleton } from '@/features/post/components/post-list-skeleton';
import { FollowingsBar } from '@/features/user/components/followings-bar';
import { toAttachmetItem } from '@/utils/file';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Filter, Search } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';

const HomeHeader: React.FC<any> = memo(function HomeHeader() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <VStack space="lg">
      <MainHeader />
      <TouchableOpacity onPress={() => router.push('/posts/search')}>
        <Input
          size="lg"
          variant="rounded"
          className="w-full"
          isReadOnly={true}
          pointerEvents="none">
          <InputSlot className="ml-3">
            <InputIcon as={Search} />
          </InputSlot>
          <InputField placeholder="搜索帖子..." />
          <InputSlot className="mx-3">
            <InputIcon as={Filter} />
          </InputSlot>
        </Input>
      </TouchableOpacity>
      <Banner />
      <Card size="sm" className="px-4">
        <VStack space="md">
          <Text size="md" bold={true}>
            我的关注
          </Text>
          {user ? <FollowingsBar /> : <AnonyView />}
        </VStack>
      </Card>
    </VStack>
  );
});

const PostList: React.FC<any> = () => {
  const router = useRouter();
  const { user } = useAuth();

  const postsQuery = useFetchPosts();
  const posts: any = _.map(
    _.flatMap(postsQuery.data?.pages, (page: any) => page.data),
    (item: any) => ({
      ...item,
      images: _.map(item.attachments || [], (attachment: any) =>
        toAttachmetItem(attachment, item.attachmentExtras),
      ),
      cover: item.cover ? toAttachmetItem(item.cover, item.attachmentExtras) : undefined,
    }),
  );

  const renderListHeader = useCallback((props: any) => <HomeHeader {...props}></HomeHeader>, []);

  const renderItem = useCallback(
    ({ item, index }: any) => <PostItem item={item} index={index} />,
    [],
  );

  const renderEmptyComponent = () => <ListEmptyView />;

  const onEndReached = () => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) postsQuery.fetchNextPage();
  };

  if (postsQuery.data) {
    return (
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 px-4" space="md">
          <>
            <FlatList
              data={posts}
              contentContainerClassName="flex-grow"
              keyExtractor={(item) => item.documentId}
              ListHeaderComponent={renderListHeader}
              ListEmptyComponent={renderEmptyComponent}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReached={onEndReached}
              refreshControl={
                <RefreshControl
                  refreshing={postsQuery.isLoading}
                  onRefresh={() => {
                    if (postsQuery.hasNextPage && !postsQuery.isLoading) {
                      postsQuery.refetch();
                    }
                  }}
                />
              }
            />
            {user && (
              <Fab size="md" placement="bottom right" onPress={() => router.push('/posts/create')}>
                <FabIcon as={AddIcon} />
                <FabLabel>发帖</FabLabel>
              </Fab>
            )}
          </>
        </VStack>
      </SafeAreaView>
    );
  }

  return <PostListSkeleton />;
};

const HomeLayout: React.FC<any> = () => {
  return (
    <CarouselProvider>
      <CommentSheetProvider>
        <PostList />
        <CarouselViewer />
        <CommentSheet />
      </CommentSheetProvider>
    </CarouselProvider>
  );
};

export default HomeLayout;
