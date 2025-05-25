import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated from 'react-native-reanimated';
import { ListEmptyView } from '@/components/list-empty-view';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import useToast from '@/hooks/use-toast';
import { useFetchPosts } from '../api';
import { UserPostItem } from './user-post-item';
import { useDeletePost } from '../api/use-delete-post';
import { useEditPostPublish } from '../api/use-edit-post-publish';

const PostListView: React.FC<any> = ({ userDocumentId }) => {
  const [status, setStatus] = useState('published');
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const isMe = userDocumentId === currentUser?.documentId;
  const isPublished = status === 'published';
  const rowRefs = useRef(new Map());

  const userPostsQuery = useFetchPosts({
    filters: {
      author: {
        documentId: userDocumentId,
      },
      isPublished,
    },
  });

  const deleteMutation = useDeletePost();

  const editPublishMutation = useEditPostPublish();

  const posts: any = _.flatMap(userPostsQuery.data?.pages, (page) => page.data);

  const closeSwipeables = () => {
    [...rowRefs.current.entries()].forEach(([key, ref]) => {
      if (ref) ref.close();
    });
  };

  const onEdit = ({ item }: any) => {
    closeSwipeables();
    router.push(`/posts/edit/${item.documentId}`);
  };

  const onPublish = ({ item }: any) => {
    toast.confirm({
      description: `确定要发布吗？`,
      onConfirm: async () => {
        editPublishMutation.mutate(
          {
            documentId: item.documentId,
            isPublished: true,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '发布成功',
              });
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onUnpublish = ({ item }: any) => {
    toast.confirm({
      description: `确定要取消发布吗？`,
      onConfirm: async () => {
        editPublishMutation.mutate(
          {
            documentId: item.documentId,
            isPublished: false,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '取消发布成功',
              });
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onDeleteBtnPress = ({ item }: any) => {
    toast.confirm({
      description: `确认要删除吗？`,
      onConfirm: async () => {
        deleteMutation.mutate(
          {
            documentId: item.documentId,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '删除成功',
              });
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onItemPress = ({ item }) => router.push(`/posts/${item.documentId}`);

  const onEndReached = () => {
    if (userPostsQuery.hasNextPage && !userPostsQuery.isFetchingNextPage) {
      userPostsQuery.fetchNextPage();
    }
  };

  const renderRightAction = ({ item }: any) => {
    return (
      <Reanimated.View>
        <HStack className="h-full">
          {item.isPublished ? (
            <Button
              size="sm"
              className="h-full rounded-none"
              action="secondary"
              onPress={() => onUnpublish({ item })}>
              <ButtonText>取消发布</ButtonText>
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-full rounded-none"
              action="secondary"
              onPress={() => onPublish({ item })}>
              <ButtonText>发布</ButtonText>
            </Button>
          )}
          <Button
            size="sm"
            className="h-full rounded-none"
            action="secondary"
            onPress={() => onEdit({ item })}>
            <ButtonText>编辑</ButtonText>
          </Button>
          <Button
            size="sm"
            className="h-full rounded-bl-none rounded-tl-none"
            action="negative"
            onPress={() => onDeleteBtnPress({ item })}>
            <ButtonText>删除</ButtonText>
          </Button>
        </HStack>
      </Reanimated.View>
    );
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <View className={`mt-6 ${index === 0 ? 'mt-0' : ''}`}>
        {isMe ? (
          <TouchableOpacity onPress={() => onItemPress({ item })}>
            <ReanimatedSwipeable
              renderRightActions={() => renderRightAction({ item })}
              ref={(ref) => {
                if (ref && !rowRefs.current.get(item.id)) {
                  rowRefs.current.set(item.id, ref);
                }
              }}
              onSwipeableWillOpen={() => {
                [...rowRefs.current.entries()].forEach(([key, ref]) => {
                  if (key !== item.id && ref) ref.close();
                });
              }}>
              <UserPostItem item={item} index={index} />
            </ReanimatedSwipeable>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => onItemPress({ item })}>
            <UserPostItem item={item} index={index} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyComponent = () => <ListEmptyView />;

  return (
    <View className="flex-1">
      {isMe && (
        <HStack className="items-center justify-end" space="sm">
          <Button
            size="sm"
            action="secondary"
            variant="link"
            onPress={() => setStatus('published')}>
            <ButtonText className={status === 'published' ? 'underline' : undefined}>
              已发布
            </ButtonText>
          </Button>
          <Divider orientation="vertical" className="h-4" />
          <Button size="sm" action="secondary" variant="link" onPress={() => setStatus('draft')}>
            <ButtonText className={status === 'draft' ? 'underline' : undefined}>未发布</ButtonText>
          </Button>
        </HStack>
      )}
      <FlatList
        data={posts}
        contentContainerClassName="flex-grow"
        nestedScrollEnabled={true}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.documentId}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={onEndReached}
        refreshControl={
          <RefreshControl
            refreshing={userPostsQuery.isLoading}
            onRefresh={() => {
              if (!userPostsQuery.isLoading) userPostsQuery.refetch();
            }}
          />
        }
      />
    </View>
  );
};

export default PostListView;
