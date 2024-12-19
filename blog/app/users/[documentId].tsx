import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  ChevronLeft,
  MapPin,
  MessageSquareText,
  ScanFace,
  Share2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { apiServerURL, fetchUser } from '@/api';
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

const UserInfo = () => {
  const { documentId } = useLocalSearchParams();
  const { user: currentUser } = useAuth();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const queryClient = useQueryClient();
  const {
    isPending,
    isError,
    isSuccess,
    data: user,
    error,
  } = useQuery({
    queryKey: ['users', documentId],
    queryFn: () => fetchUser(documentId as string),
  });
  const toast = useCustomToast();

  const {
    isSuccess: isFollowSuccess,
    isError: isFollowError,
    isPending: isFollowPending,
    mutate,
  } = useMutation({
    mutationFn: (data: any) => {
      return toggleFollow(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['follows', { following: user.documentId, follower: currentUser.documentId }],
      });
      toast.success('关注成功');
      router.dismiss();
    },
    onError(error, variables, context) {
      toast.error(error.message);
      console.error(error);
    },
  });

  const renderHeaderLeft = () => (
    <Button
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
    </Button>
  );

  const onShareButtonPressed = () => {};

  const onChatButtonPressed = () => {};

  const onFollowBtnPressed = () => {
    const data = {
      following: user.documentId,
      follower: currentUser.documentId,
    };
    mutate({ data });
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
                      uri: `${apiServerURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
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
                      <Text size="xs">{user.profile.birthday}</Text>
                    </HStack>
                    <HStack className="items-center" space="xs">
                      <Icon size="xs" as={ScanFace} />
                      <Text size="xs">{user.profile.gender === 'male' ? '男' : '女'}</Text>
                    </HStack>
                    <HStack className="items-center" space="xs">
                      <Icon size="xs" as={MapPin} />
                      <Text size="xs">重庆｜南岸区</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>
              <HStack className="items-center justify-center">
                <Text size="sm">{user.profile?.bio || '个人签名'}</Text>
              </HStack>
              <HStack className="items-center justify-center" space="2xl">
                <Pressable
                  onPress={() => onChatButtonPressed()}
                  className="items-center justify-center rounded-full bg-secondary-500 p-3">
                  <Icon size="md" as={MessageSquareText} />
                </Pressable>
                <Button
                  size="lg"
                  action="positive"
                  className="rounded-3xl px-16"
                  disabled={isFollowPending}
                  onPress={() => onFollowBtnPressed()}>
                  <ButtonText>
                    {currentUser?.followings?.includes(user.documentId) ? '关注' : '取消关注'}
                  </ButtonText>
                  {isPending && <ButtonSpinner />}
                </Button>
                <Pressable
                  onPress={() => onShareButtonPressed()}
                  className="items-center justify-center rounded-full bg-secondary-500 p-3">
                  <Icon size="md" as={Share2} />
                </Pressable>
              </HStack>
              <HStack
                space="md"
                className="justify-around rounded-lg border-y border-primary-100 bg-primary-200 py-3">
                <VStack className="flex-1 items-center justify-center border-r border-primary-50">
                  <Text size="xl" bold={true}>
                    10
                  </Text>
                  <Text size="sm">帖子</Text>
                </VStack>
                <VStack className="flex-1 items-center justify-center border-r border-primary-50">
                  <Text size="xl" bold={true}>
                    21
                  </Text>
                  <Text size="sm">关注</Text>
                </VStack>
                <VStack className="flex-1 items-center justify-center border-r border-transparent">
                  <Text size="xl" bold={true}>
                    3
                  </Text>
                  <Text size="sm">被关注</Text>
                </VStack>
              </HStack>
            </VStack>
            <SegmentedControl
              values={['帖子', '照片墙']}
              selectedIndex={selectedIndex}
              onChange={(event) => setSelectedIndex(event.nativeEvent.selectedSegmentIndex)}
            />
            {selectedIndex === 0 ? <PostListView user={user} /> : <PhotoListView user={user} />}
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default UserInfo;
