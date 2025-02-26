import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import _ from 'lodash';
import { Edit, Ellipsis, MapPin, Trash, Undo2 } from 'lucide-react-native';
import { RefreshControl } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { fetchUserPosts } from '@/api';
import { deletePost, unpublishPost } from '@/api/post';
import { formatDistance } from '@/utils/date';
import { useAuth } from './auth-context';
import { Box } from './ui/box';
import { Button, ButtonText } from './ui/button';
import { Card } from './ui/card';
import { Divider } from './ui/divider';
import { Heading } from './ui/heading';
import { HStack } from './ui/hstack';
import { Icon } from './ui/icon';
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from './ui/menu';
import { Pressable } from './ui/pressable';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';
import useCustomToast from './use-custom-toast';

const PostListView = ({ documentId, userDocumentId }: any) => {
  const [status, setStatus] = useState('published');
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const toastId = 'toast_delete';
  const { user } = useAuth();

  const { data, fetchNextPage, hasNextPage, isLoading, isSuccess, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', 'list', { userDocumentId, status }],
      queryFn: fetchUserPosts,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 20,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'authors'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', documentId],
      });
      toast.success({
        description: '删除成功',
      });
    },
    onError(error, variables, context) {
      toast.close(toastId);
      toast.error({ description: error.message });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: ({ documentId }: any) => unpublishPost({ documentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'authors'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', documentId],
        refetchType: 'none',
      });
      toast.success({
        description: '取消发布成功',
      });
    },
    onError(error, variables, context) {
      toast.close(toastId);
      toast.error({ description: error.message });
    },
  });

  const posts: any = isSuccess
    ? _.reduce(data?.pages, (result: any, item: any) => [...result, ...item.data], [])
    : [];

  const renderTrigger = (triggerProps: any) => {
    return (
      <Pressable {...triggerProps}>
        <Icon as={Ellipsis} />
      </Pressable>
    );
  };

  const onEditBtnPress = ({ item }: any) => {
    router.push(`/posts/edit/${item.documentId}?status=${item.status}`);
  };

  const onUnpublishBtnPress = ({ item }: any) => {
    toast.confirm({
      toastId,
      description: `确认要取消发布吗？`,
      onConfirm: async () => {
        toast.close(toastId);
        unpublishMutation.mutate({
          documentId: item.documentId,
        });
      },
    });
  };

  const onDeleteBtnPress = ({ item }: any) => {
    toast.confirm({
      toastId,
      description: `确认要删除吗？`,
      onConfirm: async () => {
        toast.close(toastId);
        deleteMutation.mutate({
          documentId: item.documentId,
        });
      },
    });
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <Box className={`mt-6 rounded-lg ${index === 0 ? 'mt-0' : ''}`}>
        <Pressable onPress={() => router.push(`/posts/${item.documentId}?status=${item.status}`)}>
          <Card>
            <VStack space="lg">
              <VStack space="sm">
                <HStack className="items-center justify-between">
                  <Heading numberOfLines={1} ellipsizeMode="tail" className="flex-1">
                    {item.title}
                  </Heading>
                  <Menu placement="left" trigger={renderTrigger}>
                    {status === 'draft' ? (
                      <MenuItem
                        key="Edit"
                        textValue="编辑"
                        onPress={() => onEditBtnPress({ item })}>
                        <Icon as={Edit} size="xs" className="mr-2" />
                        <MenuItemLabel size="xs">编辑</MenuItemLabel>
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key="Unpublish"
                        textValue="取消发布"
                        onPress={() => onUnpublishBtnPress({ item })}>
                        <Icon as={Undo2} size="xs" className="mr-2" />
                        <MenuItemLabel size="xs">取消发布</MenuItemLabel>
                      </MenuItem>
                    )}
                    <MenuSeparator />
                    <MenuItem
                      key="Delete"
                      textValue="删除"
                      onPress={() => onDeleteBtnPress({ item })}>
                      <Icon as={Trash} size="xs" className="mr-2" />
                      <MenuItemLabel size="xs">删除</MenuItemLabel>
                    </MenuItem>
                  </Menu>
                </HStack>
                <HStack className="items-center justify-between">
                  <Text size="xs">{formatDistance(item.createdAt)}</Text>
                  <HStack space="xs" className="items-center">
                    {item.poi?.address && (
                      <>
                        <Icon as={MapPin} size="xs" />
                        <Text size="xs">{item.poi.address}</Text>
                      </>
                    )}
                  </HStack>
                </HStack>
              </VStack>
              <Text numberOfLines={5}>{item.content}</Text>
            </VStack>
          </Card>
        </Pressable>
      </Box>
    );
  };

  const renderEmptyComponent = (props: any) => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">没有数据</Text>
      </Box>
    );
  };

  return (
    <Box className="flex-1">
      <HStack className="items-center justify-end" space="sm">
        <Button size="sm" action="secondary" variant="link" onPress={() => setStatus('published')}>
          <ButtonText className={status === 'published' ? 'underline' : undefined}>
            已发布
          </ButtonText>
        </Button>
        <Divider orientation="vertical" className="h-4" />
        <Button size="sm" action="secondary" variant="link" onPress={() => setStatus('draft')}>
          <ButtonText className={status === 'draft' ? 'underline' : undefined}>未发布</ButtonText>
        </Button>
      </HStack>
      <FlatList
        data={posts}
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
