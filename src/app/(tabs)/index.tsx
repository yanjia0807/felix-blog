import React, { memo, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { Filter, Search } from 'lucide-react-native';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '@/components/auth-provider';
import { PageFallbackUI } from '@/components/fallback';
import { MainHeader } from '@/components/header';
import ListEmptyView from '@/components/list-empty-view';
import { PagerViewProvider } from '@/components/pager-view';
import { Fab, FabIcon, FabLabel } from '@/components/ui/fab';
import { AddIcon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { CommentSheet } from '@/features/comment/components/comment-sheet';
import { CommentSheetProvider } from '@/features/comment/components/comment-sheet-provider';
import { useFetchBanners, useFetchPosts } from '@/features/post/api';
import { BannerItem } from '@/features/post/components/banner-item';
import { PostItem } from '@/features/post/components/post-item';
import { PostListSkeleton } from '@/features/post/components/post-list-skeleton';
import { isImage, isVideo, toAttachmetItem } from '@/utils/file';

const HomeHeader: React.FC<any> = memo(({ bannersQuery }) => {
  useEffect(() => console.log('@render HomeHeader'));

  const router = useRouter();

  const banners: any = _.flatMap(bannersQuery.data?.pages, (page: any) => page.data);

  const renderItem = ({ item }: any) => <BannerItem item={item} />;

  const onEndReached = () => {
    if (bannersQuery.hasNextPage && !bannersQuery.isFetchingNextPage) {
      bannersQuery.fetchNextPage();
    }
  };

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
      <FlatList
        data={banners}
        renderItem={renderItem}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onEndReached={onEndReached}
      />
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

  const bannersQuery = useFetchBanners();

  const isLoading = postsQuery.isLoading || bannersQuery.isLoading;

  const renderListHeader = useCallback(
    (props: any) => <HomeHeader {...props} bannersQuery={bannersQuery}></HomeHeader>,
    [bannersQuery],
  );

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
        {isLoading ? (
          <PostListSkeleton />
        ) : (
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
          </>
        )}
      </VStack>
      <CommentSheet />
    </SafeAreaView>
  );
};

const HomePage: React.FC<any> = () => {
  useEffect(() => console.log('@render HomePage'));

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
