import React from 'react';
import { router, Stack } from 'expo-router';
import { Fab, FabLabel, FabIcon } from '@/components/ui/fab';
import { AddIcon, Icon } from '@/components/ui/icon';
import { FlashList } from '@shopify/flash-list';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { useFetchPosts } from '@/api';
import { VStack } from '@/components/ui/vstack';
import { ProfileAvatar } from '@/components/profile-avatar';
import { Spinner } from '@/components/ui/spinner';
import colors from 'tailwindcss/colors';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { BookMarked, Ellipsis, MapPin, Share2 } from 'lucide-react-native';
import { RefreshControl, TouchableOpacity } from 'react-native';
import PostThumbnail from '@/components/post-thumbnail';
import HeartInfo from '@/components/heart-info';
import CommentInfo from '@/components/comment-info';
import AuthorInfo from '@/components/author-info';
import { Popover, PopoverBackdrop, PopoverContent, PopoverBody } from '@/components/ui/popover';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import useCustomToast from '@/components/use-custom-toast';
import _ from 'lodash';

const MenuPopover = (props: any) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Popover
      isOpen={isOpen}
      onClose={handleClose}
      onOpen={handleOpen}
      {...props}
      trigger={(triggerProps: any) => {
        return (
          <TouchableOpacity {...triggerProps}>
            <Icon as={Ellipsis} />
          </TouchableOpacity>
        );
      }}>
      <PopoverBackdrop />
      <PopoverContent className="px-2 py-1">
        <PopoverBody className="" contentContainerClassName="">
          <Button size="xs" variant="link">
            <ButtonIcon as={BookMarked} />
            <ButtonText> 收藏</ButtonText>
          </Button>
          <Divider />
          <Button size="xs" variant="link">
            <ButtonIcon as={Share2} />
            <ButtonText> 分享</ButtonText>
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const PostHome = () => {
  const toast = useCustomToast();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
    refetch,
  } = useFetchPosts();
  const posts: any = _.reduce(
    data?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const renderItem = ({ item }: any) => {
    const author = item.author;

    return (
      <Card className="mb-6 rounded-lg p-5">
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/posts/[documentId]',
              params: {
                documentId: item.documentId,
              },
            });
          }}>
          <VStack space="md">
            <HStack className="items-center justify-between">
              <AuthorInfo author={author} />
              <MenuPopover />
            </HStack>
            <HStack className="items-center justify-between">
              <Text size="xs">30分钟之前</Text>
              <HStack space="xs" className="items-center">
                <Icon as={MapPin} size="xs" />
                <Text size="xs">重庆市，渝北区</Text>
              </HStack>
            </HStack>
            <Text numberOfLines={3}>{item.content}</Text>
            <PostThumbnail item={item} />
            <HStack className="items-center justify-between">
              <HStack space="lg" className="flex-row items-center">
                <HeartInfo />
                <CommentInfo />
              </HStack>
              <HStack className="items-center">
                {Array(5)
                  .fill('https://i.pravatar.cc/150')
                  .map((item, index) => (
                    <Avatar
                      key={index}
                      size="xs"
                      style={{
                        position: 'absolute',
                        right: index * 14,
                      }}>
                      <AvatarImage
                        source={{
                          uri: item,
                        }}
                      />
                    </Avatar>
                  ))}
              </HStack>
            </HStack>
          </VStack>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderHeaderLeft = (props: any) => {
    return <ProfileAvatar className="mx-4" />;
  };

  if (status === 'pending') {
    return (
      <Spinner
        size="small"
        className="absolute bottom-0 left-0 right-0 top-0"
        color={colors.gray[500]}
      />
    );
  }

  if (status === 'error') {
    toast.error('获取数据异常');
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '记录',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4" space="md">
        <FlashList
          data={posts}
          renderItem={({ item }) => renderItem({ item })}
          estimatedItemSize={200}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              colors={['#9Bd35A', '#689F38']}
              refreshing={isFetching}
              onRefresh={() => {
                if (!isFetching) {
                  refetch();
                }
              }}
            />
          }
        />
        <Fab
          size="md"
          placement="bottom right"
          onPress={() => {
            router.push('/posts/create');
          }}>
          <FabIcon as={AddIcon} />
          <FabLabel>记录</FabLabel>
        </Fab>
      </VStack>
    </>
  );
};

export default PostHome;
