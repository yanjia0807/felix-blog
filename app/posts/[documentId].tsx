import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Edit, Ellipsis, MapPin, StickyNote, Trash, Undo2 } from 'lucide-react-native';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { deletePost, fetchPost, unpublishPost } from '@/api/post';
import AlbumPagerView from '@/components/album-pager-view';
import { useAuth } from '@/components/auth-provider';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { ImageItem, ImageList } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import PageSpinner from '@/components/page-spinner';
import { RecordingList } from '@/components/recording-input';
import { ShareButton } from '@/components/share-button';
import { TagList } from '@/components/tag-input';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from '@/components/ui/menu';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';
import { UserAvatar } from '@/components/user';
import { formatDistance } from '@/utils/date';
import {
  isImage,
  isVideo,
  FileTypeNum,
  imageFormat,
  fileFullUrl,
  isAudio,
  videoThumbnailUrl,
} from '@/utils/file';

const PostCover = ({ item, onPress }: any) => {
  return (
    <View className="h-36 w-full">
      <TouchableOpacity onPress={onPress}>
        <View className="items-center justify-center">
          <Image
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 6,
              opacity: 0.7,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            alt={item.cover.alternativeText || item.cover.name}
            source={item.cover.thumbnail}
          />
          {isVideo(item.cover.fileType) && (
            <View className="absolute">
              <Ionicons name="play-circle-outline" size={42} className="opacity-50" color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const PostDetail: React.FC = () => {
  const { documentId, status } = useLocalSearchParams();
  const [isPagerOpen, setIsPagerOpen] = useState(false);
  const [pagerIndex, setPagerIndex] = useState<number>(0);
  const onPagerClose = () => setIsPagerOpen(false);

  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const postQuery = useQuery({
    queryKey: ['posts', 'detail', documentId],
    queryFn: () => fetchPost({ documentId, status }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ documentId }: any) => deletePost({ documentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', documentId],
      });
      toast.success({
        description: '删除成功',
      });
      router.back();
    },
    onError(error, variables, context) {
      toast.close();
      toast.error({ description: error.message });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: ({ documentId }: any) => unpublishPost({ documentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', documentId],
        refetchType: 'none',
      });
      toast.success({
        description: '取消发布成功',
      });
      navigation.setParams({
        status: 'draft',
      });
    },
    onError(error, variables, context) {
      toast.close();
      toast.error({ description: error.message });
    },
  });

  let post: any;

  if (postQuery.isSuccess) {
    const postData = postQuery.data;

    let cover = undefined;
    if (postData.cover) {
      if (isImage(postData.cover.mime)) {
        cover = {
          ...postData.cover,
          fileType: FileTypeNum.Image,
          uri: fileFullUrl(postData.cover),
          thumbnail: imageFormat(postData.cover, 's', 's')?.fullUrl,
          preview: imageFormat(postData.cover, 'l')?.fullUrl,
        };
      } else {
        cover = {
          ...postData.cover,
          fileType: FileTypeNum.Video,
          uri: fileFullUrl(postData.cover),
          thumbnail: videoThumbnailUrl(postData.cover, postData.attachmentExtras),
          preview: fileFullUrl(postData.cover),
        };
      }
    }

    const images = _.map(
      _.filter(
        postData.attachments || [],
        (item: any) => isImage(item.mime) || isVideo(item.mime),
      ) || [],
      (item: any) => {
        return isImage(item.mime)
          ? {
              ...item,
              fileType: FileTypeNum.Image,
              uri: fileFullUrl(item),
              thumbnail: imageFormat(item, 's', 's')?.fullUrl,
              preview: imageFormat(item, 'l')?.fullUrl,
            }
          : {
              ...item,
              fileType: FileTypeNum.Video,
              uri: fileFullUrl(item),
              thumbnail: videoThumbnailUrl(item, postData.attachmentExtras),
              preview: fileFullUrl(item),
            };
      },
    );

    const album = _.concat(cover ? cover : [], images);

    const recordings = _.map(
      _.filter(postData.attachments || [], (item: any) => isAudio(item.mime)),
      (item: any) => ({
        id: item.id,
        data: item,
        fileType: FileTypeNum.Audio,
        uri: fileFullUrl(item),
      }),
    );

    post = {
      ...postData,
      cover,
      images,
      album,
      recordings,
    };
  }

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <ShareButton className="h-8 w-8 items-center justify-center rounded-full" />
  );

  const renderTrigger = (triggerProps: any) => {
    return (
      <TouchableOpacity {...triggerProps}>
        <Icon as={Ellipsis} />
      </TouchableOpacity>
    );
  };

  const onEditBtnPress = () => {
    router.push(`/posts/edit/${documentId}?status=${status}`);
  };

  const onUnpublishBtnPress = () => {
    toast.confirm({
      description: `确认要取消发布吗？`,
      onConfirm: async () => {
        toast.close();
        unpublishMutation.mutate({
          documentId,
        });
      },
    });
  };

  const onDeleteBtnPress = () => {
    toast.confirm({
      description: `确认要删除吗？`,
      onConfirm: async () => {
        toast.close();
        deleteMutation.mutate({
          documentId,
        });
      },
    });
  };

  const onCoverPress = () => {
    setPagerIndex(0);
    setIsPagerOpen(true);
  };

  const onImagePress = (index: number) => {
    setPagerIndex(index + (post.cover ? 1 : 0));
    setIsPagerOpen(true);
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      />
      <PageSpinner isVisiable={postQuery.isLoading} />
      {postQuery.isSuccess && (
        <>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
            <VStack className="flex-1 p-4" space="lg">
              <PostCover item={post} onPress={onCoverPress} />
              <HStack className="items-center justify-between" space="xl">
                <Heading size="lg" className="flex-1">
                  {post.title}
                </Heading>
                {status === 'draft' && (
                  <HStack className="items-center" space="xs">
                    <Icon as={StickyNote} size="sm" />
                    <Text size="sm" className="text-gray-400">
                      未发布
                    </Text>
                  </HStack>
                )}
                {user?.documentId === post?.author?.documentId && (
                  <Menu placement="left" trigger={renderTrigger}>
                    {status === 'draft' ? (
                      <MenuItem key="Edit" textValue="编辑" onPress={() => onEditBtnPress()}>
                        <Icon as={Edit} size="xs" className="mr-2" />
                        <MenuItemLabel size="xs">编辑</MenuItemLabel>
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key="Unpublish"
                        textValue="取消发布"
                        onPress={() => onUnpublishBtnPress()}>
                        <Icon as={Undo2} size="xs" className="mr-2" />
                        <MenuItemLabel size="xs">取消发布</MenuItemLabel>
                      </MenuItem>
                    )}
                    <MenuSeparator />
                    <MenuItem key="Delete" textValue="删除" onPress={() => onDeleteBtnPress()}>
                      <Icon as={Trash} size="xs" className="mr-2" />
                      <MenuItemLabel size="xs">删除</MenuItemLabel>
                    </MenuItem>
                  </Menu>
                )}
              </HStack>
              <HStack className="items-center justify-between">
                <Text size="xs">{formatDistance(post?.createdAt)}</Text>
                {post.poi?.address && (
                  <HStack className="items-center">
                    <Icon as={MapPin} size="xs" />
                    <Text size="xs" className="flex-wrap">
                      {post.poi.address}
                    </Text>
                  </HStack>
                )}
              </HStack>
              <HStack className="items-center justify-between">
                <UserAvatar user={post.author} />
                <HStack space="md" className="items-center justify-end">
                  <LikeButton post={post} />
                  <CommentIcon item={post} />
                </HStack>
              </HStack>
              <TagList value={post.tags} readonly={true} />
              <ImageList value={post.images} onPress={onImagePress} />
              <RecordingList value={post.recordings} readonly={true} />
              <Divider />
              <Text size="lg">{post.content}</Text>
              <Divider />
              <HStack className="items-center justify-end">
                <HStack space="md" className="items-center justify-end">
                  <LikeButton post={post} />
                  <CommentIcon item={post} />
                </HStack>
              </HStack>
            </VStack>
          </ScrollView>
          <AlbumPagerView
            initIndex={pagerIndex}
            value={post.album}
            isOpen={isPagerOpen}
            onClose={onPagerClose}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const PostDetailPage: React.FC = () => (
  <CommentProvider>
    <PostDetail />
    <CommentSheet />
  </CommentProvider>
);

export default PostDetailPage;
