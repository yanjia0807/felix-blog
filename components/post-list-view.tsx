import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import _ from 'lodash';
import { Edit, Ellipsis, MapPin, Trash } from 'lucide-react-native';
import { RefreshControl } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { fetchUserPosts } from '@/api';
import { formatDistance } from '@/utils/date';
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
  const [filters, setFilters] = useState({ userDocumentId, status: 'published' });
  const toast = useCustomToast();
  const { data, fetchNextPage, hasNextPage, isLoading, isSuccess, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', 'list', filters],
      queryFn: fetchUserPosts,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 20,
        },
        filters,
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
            filters,
          };
        }

        return null;
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

  const onDeleteBtnPress = ({ item }: any) => {
    toast.confirm({
      description: `确认要删除吗？`,
      onConfirm: async () => {},
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
                    <MenuItem key="Edit" textValue="编辑" onPress={() => onEditBtnPress({ item })}>
                      <Icon as={Edit} size="xs" className="mr-2" />
                      <MenuItemLabel size="xs">编辑</MenuItemLabel>
                    </MenuItem>
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

  const onPublishedBtnPress = () => {
    setFilters((prev: any) => ({ ...prev, status: 'published' }));
  };

  const onDraftBtnPress = () => {
    setFilters((prev: any) => ({ ...prev, status: 'draft' }));
  };

  return (
    <Box className="flex-1">
      <HStack className="items-center justify-end" space="sm">
        <Button size="sm" action="secondary" variant="link" onPress={() => onPublishedBtnPress()}>
          <ButtonText className={filters.status === 'published' ? 'underline' : undefined}>
            已发布
          </ButtonText>
        </Button>
        <Divider orientation="vertical" className="h-4" />
        <Button size="sm" action="secondary" variant="link" onPress={() => onDraftBtnPress()}>
          <ButtonText className={filters.status === 'draft' ? 'underline' : undefined}>
            未发布
          </ButtonText>
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
