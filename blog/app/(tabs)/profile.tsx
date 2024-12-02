import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { FlashList, MasonryFlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import _ from 'lodash';
import { BookMarked, Heart, MapPin, MessageCircle } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { fetchCount, fetchMyPosts, fetchMyPhotos } from '@/api';
import { apiServerURL } from '@/api';
import { useAuth } from '@/components/auth-context';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import UserInfoHeader from '@/components/user-info-header';

const { width } = Dimensions.get('window');
const numColumns = 2;

const PostListView = () => {
  const { user } = useAuth();

  const { data, error, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', user.documentId],
      queryFn: fetchMyPosts,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 5,
        },
        userDocumentId: user.documentId,
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
            userDocumentId: user.documentId,
          };
        }

        return null;
      },
    });

  const posts: any = _.reduce(
    data?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity onPress={() => {}} className="my-3 rounded-lg bg-background-0 p-4">
        <VStack space="lg">
          <HStack className="items-start justify-start" space="md">
            <VStack space="md" className="flex-1">
              <Heading numberOfLines={1} size="md">
                {item.title}
              </Heading>
              <HStack className="items-center justify-between">
                <Text size="xs">30分钟之前</Text>
                <HStack space="xs" className="items-center">
                  <Icon as={MapPin} size="xs" />
                  <Text size="xs">重庆市，渝北区</Text>
                </HStack>
              </HStack>
              <Text numberOfLines={3} size="sm">
                {item.content}
              </Text>
            </VStack>
          </HStack>
          <HStack className="items-center justify-end" space="md">
            <HStack space="lg" className="flex-row items-center">
              <HStack space="xs" className="items-center">
                <Icon as={Heart} />
                <Text size="xs">{item?.likedByUsers?.count}</Text>
              </HStack>
              <HStack space="xs" className="items-center">
                <Icon as={BookMarked} />
                <Text size="xs">{item?.favoritedByUsers?.count}</Text>
              </HStack>
              <HStack space="xs" className="items-center">
                <Icon as={MessageCircle} />
                <Text size="xs">{item?.comments?.count}</Text>
              </HStack>
            </HStack>
          </HStack>
        </VStack>
      </TouchableOpacity>
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
      {user ? (
        <FlashList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.documentId}
          estimatedItemSize={154}
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
              colors={['#9Bd35A', '#689F38']}
              refreshing={isLoading}
              onRefresh={() => {
                if (!isLoading) {
                  refetch();
                }
              }}
            />
          }
        />
      ) : (
        <></>
      )}
    </Box>
  );
};

const PhotoListView = () => {
  const { user } = useAuth();

  const renderEmptyComponent = (props: any) => {
    return (
      <Box className="mt-10 w-full items-center justify-center">
        <Text size="sm">没有数据</Text>
      </Box>
    );
  };

  const { data, error, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['posts', user.documentId, 'photos'],
      queryFn: fetchMyPhotos,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 5,
        },
        userDocumentId: user.documentId,
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
            userDocumentId: user.documentId,
          };
        }

        return null;
      },
    });

  const listData = useMemo(() => {
    let files = [];
    console.log('!', data);

    if (data) {
      files = _.reduce(
        data.pages,
        (result: any, page: any) => {
          const pageFiles = _.reduce(
            page.data,
            (pageResult: any, item: any) => {
              let temp: any = [];
              if (item.cover) {
                temp = [...temp, { ...item.cover, type: 'cover' }];
              }
              const attachment = _.find(
                item.blocks,
                (block: any) => block['__component'] === 'shared.attachment',
              );
              if (attachment?.files.length > 0) {
                temp = [
                  ...temp,
                  ..._.filter(attachment.files, (file: any) => file.mime.startsWith('image/')),
                ];
              }
              return [...pageResult, ...temp];
            },
            [],
          );
          return [...result, ...pageFiles];
        },
        [],
      );
    }
    return files;
  }, [data]);

  const renderItem = ({ item }: any) => {
    return (
      <Image
        recyclingKey={item.id}
        source={{ uri: `${apiServerURL}/${item.formats.small.url}` }}
        contentFit="cover"
        style={{
          flex: 1,
          aspectRatio: 1,
          marginLeft: 1,
        }}
        alt={`Photo by ${item.author}`}
      />
    );
  };

  return (
    <Box className="mr-1/4 flex-1">
      {user ? (
        <MasonryFlashList
          data={listData}
          getItemType={() => 'image'}
          renderItem={renderItem}
          numColumns={numColumns}
          ItemSeparatorComponent={() => <Box style={{ marginBottom: 1 }} />}
          ListEmptyComponent={renderEmptyComponent}
          estimatedItemSize={width / numColumns}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              colors={['#9Bd35A', '#689F38']}
              refreshing={isLoading}
              onRefresh={() => {
                if (!isLoading) {
                  refetch();
                }
              }}
            />
          }
          showsVerticalScrollIndicator={false}
          getColumnFlex={(items, index, maxColumns, extraData) => {
            console.log('@', items, index, maxColumns, extraData);
            return numColumns;
          }}
        />
      ) : (
        <></>
      )}
    </Box>
  );
};

const Profile = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user } = useAuth();

  const { data: total } = useQuery<any>({
    queryKey: ['posts', user?.documentId, 'total'],
    queryFn: () => fetchCount(),
    enabled: !!user,
  });

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '我的',
        }}
      />
      {user ? (
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          <VStack className="flex-1" space="xl">
            <UserInfoHeader />
            <Divider />
            <HStack space="md" className="justify-around">
              <VStack className="items-center justify-center">
                <Text size="xl" bold={true}>
                  {total?.data || 0}
                </Text>
                <Text size="sm">帖子</Text>
              </VStack>
              <VStack className="items-center justify-center">
                <Text size="xl" bold={true}>
                  21
                </Text>
                <Text size="sm">关注</Text>
              </VStack>
              <VStack className="items-center justify-center">
                <Text size="xl" bold={true}>
                  3
                </Text>
                <Text size="sm">被关注</Text>
              </VStack>
            </HStack>
            <Divider />
            <SegmentedControl
              values={['我的帖子', '照片墙']}
              selectedIndex={selectedIndex}
              onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
            />
            {selectedIndex === 0 ? <PostListView /> : <PhotoListView />}
          </VStack>
        </ScrollView>
      ) : (
        <></>
      )}
    </SafeAreaView>
  );
};

export default Profile;
