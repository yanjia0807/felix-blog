import React, { useEffect, useState } from 'react';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Divider } from '@/components/ui/divider';
import { Stack } from 'expo-router';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { FlashList, MasonryFlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Dimensions } from 'react-native';
import { fetchPosts } from '@/api';
import UserInfoHeader from '@/components/user-info-header';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/auth-context';

const { width } = Dimensions.get('window');
const numColumns = 2;

const PostListView = () => {
  const {
    data: posts,
    error,
    isLoading,
    isSuccess,
  }: any = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialPageParam: {
      pagination: {
        start: 0,
        limit: 10,
      },
    },
    getNextPageParam: (lastPage: any) => {
      const {
        meta: {
          pagination: { limit, start, total },
        },
      } = lastPage;

      if (start + limit >= total) {
        return null;
      }

      return {
        pagination: { limit, start: start + limit },
      };
    },
  });

  const renderItem = ({ item }: any) => {
    return (
      <Card className="my-2 rounded-lg">
        <Text className="mb-2 text-sm font-normal text-typography-700">{item.publishedAt}</Text>
        <VStack className="mb-6">
          <Heading size="md" className="mb-4">
            {item.title}
          </Heading>
          <Text size="sm">{item.content}</Text>
        </VStack>
      </Card>
    );
  };

  return (
    <Box className="flex-1">
      {isLoading && <Spinner />}
      <FlashList
        data={posts}
        renderItem={renderItem}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </Box>
  );
};

const PhotoListView = () => {
  const [photos, setPhotos] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=15`);
      const data = await response.json();
      setPhotos((prevPhotos: any) => [...prevPhotos, ...data]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const renderItem = ({ item }: any) => {
    return (
      <Image
        recyclingKey={item.id}
        source={{ uri: item.download_url }}
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
      <MasonryFlashList
        data={photos}
        getItemType={() => 'image'}
        renderItem={renderItem}
        numColumns={numColumns}
        ItemSeparatorComponent={() => <Box style={{ marginBottom: 1 }} />}
        estimatedItemSize={width / numColumns}
        onEndReached={fetchPhotos}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

const Profile = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user } = useAuth();

  return (
    <>
      <Stack.Screen
        options={{
          title: '我的',
        }}
      />
      {user ? (
        <VStack className="flex-1 p-6" space="xl">
          <UserInfoHeader />
          <Divider />
          <HStack space="md" className="justify-around">
            <VStack className="items-center justify-center">
              <Text size="xl" bold={true}>
                400
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
      ) : (
        <></>
      )}
    </>
  );
};

export default Profile;
