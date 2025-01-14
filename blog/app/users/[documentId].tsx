import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import {
  Calendar,
  ChevronLeft,
  MapPin,
  MessageCircle,
  ScanFace,
  Share2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { apiServerURL, createChat, fetchChatByUsers, fetchUser } from '@/api';
import { toggleFollow } from '@/api/follow';
import { useAuth } from '@/components/auth-context';
import PhotoListView from '@/components/photo-list-view';
import PostListView from '@/components/post-list-view';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

const UserDetail = () => {
  const { user: currentUser } = useAuth();
  const { documentId }: any = useLocalSearchParams();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const userDocumentIds = [currentUser.documentId, documentId];

  const {
    isPending,
    isSuccess,
    data: user,
  } = useQuery({
    queryKey: ['users', documentId],
    queryFn: () => fetchUser(documentId),
  });

  const { mutate: createChatMutate } = useMutation({
    mutationFn: () =>
      createChat({
        userDocumentIds,
      }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: ['chats', 'detail', { userDocumentIds }] });
      await queryClient.invalidateQueries({
        queryKey: ['chats', 'list'],
      });
    },
  });

  const { data: chatData, isSuccess: isQueryChatSuccess } = useQuery({
    queryKey: ['chats', 'detail', { userDocumentIds }],
    queryFn: () => {
      return fetchChatByUsers({ userDocumentIds });
    },
  });

  const isFollowed = !_.isUndefined(
    currentUser &&
      user &&
      _.find(currentUser.followings, {
        following: { documentId: user.documentId },
      }),
  );

  const {
    isSuccess: isFollowSuccess,
    isError: isFollowError,
    isPending: isFollowPending,
    mutate: followMutate,
  } = useMutation({
    mutationFn: (data: any) => {
      return toggleFollow(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'me'],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', documentId],
      });
      toast.success({
        description: isFollowed ? '取消关注成功' : '关注成功',
      });
    },
    onError(error, variables, context) {
      toast.error(error.message);
      console.error(error);
    },
  });

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const onShareButtonPressed = () => {};

  const onChatButtonPressed = () => {
    if (isQueryChatSuccess) {
      if (chatData) {
        router.push(`/chat/${chatData.documentId}`);
      } else {
        createChatMutate(undefined, {
          onSuccess: (data: any) => {
            router.push(`/chat/${data.documentId}`);
          },
        });
      }
    }
  };

  const onFollowBtnPressed = () => {
    const data = {
      follower: currentUser.documentId,
      following: user.documentId,
      isFollowed,
    };
    followMutate(data);
  };

  const onFollowingsBtnPress = () => {
    router.push({
      pathname: '/following-list',
      params: {
        documentId: user.documentId,
        username: user.username,
      },
    });
  };

  const onFollowersBtnPress = () => {
    router.push({
      pathname: '/follower-list',
      params: {
        documentId: user.documentId,
        username: user.username,
      },
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      {isPending && <Spinner className="absolute bottom-0 left-0 right-0 top-0 z-50"></Spinner>}
      {isSuccess && (
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          <VStack className="flex-1" space="3xl">
            <VStack space="2xl">
              <HStack className="items-center" space="lg">
                <Avatar size="xl" className="shadow">
                  <AvatarImage
                    source={{
                      uri: `${apiServerURL}/${user.avatar?.formats.thumbnail.url}`,
                    }}
                  />
                </Avatar>
                <VStack space="sm">
                  <Text size="2xl" bold={true}>
                    {user.username}
                  </Text>
                  <HStack space="sm">
                    <HStack className="items-center" space="xs">
                      <Icon size="xs" as={Calendar} />
                      <Text size="xs">{user.birthday}</Text>
                    </HStack>
                    <HStack className="items-center" space="xs">
                      <Icon size="xs" as={ScanFace} />
                      <Text size="xs">{user.gender === 'male' ? '男' : '女'}</Text>
                    </HStack>
                    {user.district && (
                      <HStack className="items-center" space="xs">
                        <Icon size="xs" as={MapPin} />
                        <Text size="xs">{`${user.district.provinceName}|${user.district.cityName}|${user.district.districtName}`}</Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </HStack>
              <HStack className="items-center justify-center">
                <Text size="sm">{user.bio || '个人签名'}</Text>
              </HStack>
              <HStack className="items-center justify-center" space="2xl">
                <Button
                  size="md"
                  action="secondary"
                  onPress={() => onChatButtonPressed()}
                  className="items-center justify-center rounded-3xl p-2.5">
                  <ButtonIcon as={MessageCircle} />
                </Button>
                <Button
                  action={isFollowed ? 'negative' : 'positive'}
                  size="md"
                  className="rounded-3xl px-12"
                  disabled={isFollowPending}
                  onPress={() => onFollowBtnPressed()}>
                  <ButtonText>{isFollowed ? '取消关注' : '关注'}</ButtonText>
                  {isPending && <ButtonSpinner />}
                </Button>
                <Button
                  action="secondary"
                  size="md"
                  onPress={() => onShareButtonPressed()}
                  className="items-center justify-center rounded-3xl p-2.5">
                  <ButtonIcon as={Share2} />
                </Button>
              </HStack>
              <HStack
                space="md"
                className="justify-around rounded-lg border-y border-primary-100 bg-primary-200 py-3">
                <VStack className="items-center justify-center">
                  <Text size="xl" bold={true}>
                    {user.posts?.count}
                  </Text>
                  <Text size="sm">帖子</Text>
                </VStack>
                <Pressable onPress={() => onFollowingsBtnPress()}>
                  <VStack className="items-center justify-center">
                    <Text size="xl" bold={true}>
                      {user.followings.count}
                    </Text>
                    <Text size="sm">关注</Text>
                  </VStack>
                </Pressable>
                <Pressable onPress={() => onFollowersBtnPress()}>
                  <VStack className="items-center justify-center">
                    <Text size="xl" bold={true}>
                      {user.followers.count}
                    </Text>
                    <Text size="sm">被关注</Text>
                  </VStack>
                </Pressable>
              </HStack>
            </VStack>
            <SegmentedControl
              values={['帖子', '照片墙']}
              selectedIndex={selectedIndex}
              onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
            />
            {selectedIndex === 0 ? <PostListView /> : <PhotoListView />}
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default UserDetail;
