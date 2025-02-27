import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Edit, Ellipsis, MapPin, StickyNote, Trash, Undo2 } from 'lucide-react-native';
import { ScrollView } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { apiServerURL } from '@/api';
import { deletePost, fetchPost, unpublishPost } from '@/api/post';
import { AuthorInfo, useAuth } from '@/components/auth-context';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { ImageList } from '@/components/image-input';
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
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';
import { formatDistance } from '@/utils/date';

const PostDetail: React.FC = () => {
  const { documentId, status } = useLocalSearchParams();
  const [gallery, setGallery] = useState<any>({
    images: [],
    index: 0,
  });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const toastId = 'toastId';
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const {
    isLoading,
    isSuccess,
    data: post,
  } = useQuery({
    queryKey: ['posts', 'detail', documentId],
    queryFn: () => fetchPost({ documentId, status }),
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
      router.back();
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
      navigation.setParams({
        status: 'draft',
      });
    },
    onError(error, variables, context) {
      toast.close(toastId);
      toast.error({ description: error.message });
    },
  });

  const cover = post?.cover
    ? {
        ...post.cover,
        uri: `${apiServerURL}${post.cover.formats?.large?.url || post.cover.url}`,
        largeUri: `${apiServerURL}${post.cover.formats?.large?.url || post.cover.url}`,
        cover: true,
      }
    : undefined;

  const images = _.map(
    _.find(post?.attachments || [], { type: 'image' })?.files || [],
    (item: any) => ({
      ...item,
      uri: `${apiServerURL}${item.formats?.thumbnail.url}`,
      largeUri: `${apiServerURL}${item.formats?.large?.url || item.url}`,
      cover: false,
    }),
  );

  const galleryImages = _.concat(
    [],
    cover
      ? {
          ...cover,
          uri: cover.largeUri || cover.uri,
        }
      : [],
    images
      ? images.map((item: any) => ({
          ...item,
          uri: item.largeUri || item.uri,
        }))
      : [],
  );

  const recordings = _.map(
    _.find(post?.attachments || [], { type: 'audio' })?.files || [],
    (item: any) => ({
      ...item,
      uri: `${apiServerURL}${item.url}`,
    }),
  );

  const onSetGallery = (index: number) => {
    setGallery({
      images: galleryImages,
      index,
    });
    setIsGalleryOpen(true);
  };

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
      <Pressable {...triggerProps}>
        <Icon as={Ellipsis} />
      </Pressable>
    );
  };

  const onEditBtnPress = () => {
    router.push(`/posts/edit/${documentId}?status=${status}`);
  };

  const onUnpublishBtnPress = () => {
    toast.confirm({
      toastId,
      description: `确认要取消发布吗？`,
      onConfirm: async () => {
        toast.close(toastId);
        unpublishMutation.mutate({
          documentId,
        });
      },
    });
  };

  const onDeleteBtnPress = () => {
    toast.confirm({
      toastId,
      description: `确认要删除吗？`,
      onConfirm: async () => {
        toast.close(toastId);
        deleteMutation.mutate({
          documentId,
        });
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
          headerRight: renderHeaderRight,
        }}
      />
      <PageSpinner isVisiable={isLoading} />
      {isSuccess && (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
          <VStack className="flex-1 p-4" space="lg">
            <VStack space="sm">
              <HStack className="items-center justify-between" space="lg">
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
              <TagList value={post.tags} readonly={true} />
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
                <AuthorInfo author={post.author} />
                <HStack space="md" className="items-center justify-end">
                  <LikeButton post={post} />
                  <CommentIcon item={post} />
                </HStack>
              </HStack>
            </VStack>
            <VStack space="sm">
              {cover && (
                <Pressable className="h-36 flex-1" onPress={() => onSetGallery(0)}>
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 8,
                    }}
                    source={{
                      uri: cover.uri,
                    }}
                    alt={cover.alternativeText}
                  />
                </Pressable>
              )}
              <ImageList
                value={images}
                galleryInitIndex={cover ? 1 : 0}
                onSetGallery={onSetGallery}
              />
              <RecordingList value={recordings} readonly={true} />
            </VStack>
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
      )}
      <GalleryPreview
        images={gallery.images}
        initialIndex={gallery.index}
        isVisible={isGalleryOpen}
        onRequestClose={() => setIsGalleryOpen(false)}
      />
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
