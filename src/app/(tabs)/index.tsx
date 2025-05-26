import React, { memo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Filter, Search } from 'lucide-react-native';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { PageFallbackUI } from '@/components/fallback';
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
import { PagerViewProvider } from '@/features/image/components/pager-view-provider';
import { useFetchPosts } from '@/features/post/api';
import { Banner } from '@/features/post/components/banner';
import { PostItem } from '@/features/post/components/post-item';
import { PostListSkeleton } from '@/features/post/components/post-list-skeleton';
import { FollowingsBar } from '@/features/user/components/followings-bar';
import { isImage, isVideo, toAttachmetItem } from '@/utils/file';

const HomeHeader: React.FC<any> = memo(() => {
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
          {!_.isNil(user) ? <FollowingsBar /> : <AnonyView />}
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
    (item: any) => {
      {
        const cover = !item.cover ? undefined : toAttachmetItem(item.cover, item.attachmentExtras);
        const attachmentList = _.map(
          _.filter(item.attachments || [], (item: any) => isImage(item.mime) || isVideo(item.mime)),
          (attachment: any) => toAttachmetItem(attachment, item.attachmentExtras),
        );
        const album = _.concat(cover ? cover : [], attachmentList);

        return {
          ...item,
          attachmentList,
          cover,
          album,
        };
      }
    },
  );

  const isLoading = postsQuery.isLoading;

  const renderListHeader = useCallback((props: any) => <HomeHeader {...props}></HomeHeader>, []);

  const renderListItem = useCallback(
    ({ item, index }: any) => <PostItem item={item} index={index} />,
    [],
  );

  const renderEmptyComponent = () => <ListEmptyView />;

  const onEndReached = () => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) postsQuery.fetchNextPage();
  };

  return (
    <SafeAreaView className="flex-1">
      <VStack className="flex-1 px-4" space="md">
        {postsQuery.isSuccess && (
          <>
            <FlatList
              data={posts}
              contentContainerClassName="flex-grow"
              keyExtractor={(item) => item.documentId}
              ListHeaderComponent={renderListHeader}
              ListEmptyComponent={renderEmptyComponent}
              renderItem={renderListItem}
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
            <CommentSheet />
          </>
        )}
        {isLoading && <PostListSkeleton />}
      </VStack>
    </SafeAreaView>
  );
};

const HomePage: React.FC<any> = () => {
  return (
    <PagerViewProvider>
      <CommentSheetProvider>
        <PostList />
      </CommentSheetProvider>
    </PagerViewProvider>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default HomePage;
