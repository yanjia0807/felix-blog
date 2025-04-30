import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated from 'react-native-reanimated';
import { fetchUserPosts } from '@/api';
import { deletePost, unpublishPost } from '@/api/post';
import { formatDistance } from '@/utils/date';
import { useAuth } from './auth-provider';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
import { Card } from './ui/card';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
import useCustomToast from '../hooks/use-custom-toast';

interface PostListViewProps {
  userDocumentId: string;
}

interface PostItemProps {
  item: any;
  index: number;
}

const PostItem: React.FC<PostItemProps> = ({ item, index }) => (
  <Card size="sm">
    <VStack space="lg">
      <VStack space="sm">
        <HStack className="items-center justify-between">
          <Heading numberOfLines={1} ellipsizeMode="tail" className="flex-1">
            {item.title}
          </Heading>
        </HStack>
        <HStack className="items-center justify-between">
          <Text size="xs" className="items-center">
            {formatDistance(item.createdAt)}
          </Text>
          <HStack space="xs" className="w-1/2 items-center justify-end">
            {item.poi?.address && (
              <>
                <Icon as={MapPin} size="xs" />
                <Text size="xs" numberOfLines={1}>
                  {item.poi.address}
                </Text>
              </>
            )}
          </HStack>
        </HStack>
      </VStack>
      <Text numberOfLines={5}>{item.content}</Text>
    </VStack>
  </Card>
);

const PostListView: React.FC<PostListViewProps> = ({ userDocumentId }) => {
  const [status, setStatus] = useState('published');
  const queryClient = useQueryClient();
  const router = useRouter();
  const toast = useCustomToast();
  const { user: currentUser } = useAuth();
  const isMe = userDocumentId === currentUser?.documentId;

  const { data, fetchNextPage, hasNextPage, isLoading, isSuccess, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', 'list', { userDocumentId, status }],
      queryFn: fetchUserPosts,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 5,
        },
        userDocumentId,
        status,
      },
      getNextPageParam: (lastPage: any) => {
        const {
          meta: {
            pagination: { page, pageSize, pageCount },
          },
        } = lastPage;

        if (page < pageCount) {
          return {
            pagination: { page: page + 1, pageSize },
            userDocumentId,
            status,
          };
        }

        return null;
      },
    });

  const deleteMutation = useMutation({
    mutationFn: ({ documentId }: any) => deletePost({ documentId }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', variables.documentId],
      });
      toast.success({
        description: '删除成功',
      });
    },
    onError(error, variables, context) {
      toast.close();
      toast.error({ description: error.message });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: ({ documentId }: any) => unpublishPost({ documentId }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', variables.documentId],
        refetchType: 'none',
      });
      toast.success({
        description: '取消发布成功',
      });
    },
    onError(error, variables, context) {
      toast.close();
      toast.error({ description: error.message });
    },
  });

  const posts: any = isSuccess
    ? _.reduce(data?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : [];

  const onEditBtnPress = ({ item }: any) => {
    router.push(`/posts/edit/${item.documentId}?status=${item.status}`);
  };

  const onUnpublishBtnPress = ({ item }: any) => {
    toast.confirm({
      description: `确认要取消发布吗？`,
      onConfirm: async () => {
        toast.close();
        unpublishMutation.mutate({
          documentId: item.documentId,
        });
      },
    });
  };

  const onDeleteBtnPress = ({ item }: any) => {
    toast.confirm({
      description: `确认要删除吗？`,
      onConfirm: async () => {
        toast.close();
        deleteMutation.mutate({
          documentId: item.documentId,
        });
      },
    });
  };

  const renderRightAction = ({ item }: any) => {
    return (
      <Reanimated.View>
        <HStack className="h-full">
          {status === 'draft' ? (
            <Button
              size="sm"
              className="h-full rounded-none"
              action="secondary"
              onPress={() => onEditBtnPress({ item })}>
              <ButtonText>编辑</ButtonText>
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-full rounded-none"
              action="secondary"
              onPress={() => onUnpublishBtnPress({ item })}>
              <ButtonText>取消发布</ButtonText>
            </Button>
          )}
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
    const onItemPress = () => router.push(`/posts/${item.documentId}?status=${item.status}`);

    return (
      <View className={`mt-6 ${index === 0 ? 'mt-0' : ''}`}>
        {isMe ? (
          <TouchableOpacity onPress={onItemPress}>
            <ReanimatedSwipeable renderRightActions={() => renderRightAction({ item })}>
              <PostItem item={item} index={index} />
            </ReanimatedSwipeable>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onItemPress}>
            <PostItem item={item} index={index} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyComponent = (props: any) => {
    return (
      <View className="flex-1 items-center justify-center">
        <Text size="sm">没有数据</Text>
      </View>
    );
  };

  return (
    <Box className="flex-1">
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
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              if (!isLoading) {
                refetch();
              }
            }}
          />
        }
      />
    </Box>
  );
};

export default PostListView;
