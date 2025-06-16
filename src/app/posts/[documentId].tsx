import { CarouselProvider, useCarousel } from '@/components/carousel-provider';
import CarouselViewer from '@/components/carousel-viewer';
import { ImageryItem } from '@/components/imagery-item';
import { ImageryList } from '@/components/imagery-list';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from '@/components/ui/menu';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { CommentIcon } from '@/features/comment/components/comment-icon';
import { CommentSheet } from '@/features/comment/components/comment-sheet';
import { CommentSheetProvider } from '@/features/comment/components/comment-sheet-provider';
import { useDeletePost } from '@/features/post/api/use-delete-post';
import { useEditPostPublish } from '@/features/post/api/use-edit-post-publish';
import { useFetchPost } from '@/features/post/api/use-fetch-post';
import { LikeButton } from '@/features/post/components/like-button';
import { PostDetailSkeleton } from '@/features/post/components/post-detail-skeleton';
import { ShareButton } from '@/features/post/components/share-button';
import useCoverDimensions from '@/features/post/hooks/use-cover-dimensions';
import { TagList } from '@/features/tag/components/tag-list';
import { UserAvatar } from '@/features/user/components/user-avatar';
import useToast from '@/hooks/use-toast';
import { formatDistance } from '@/utils/date';
import { toAttachmetItem } from '@/utils/file';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import _ from 'lodash';
import { Edit, Ellipsis, MapPin, Redo2, Trash, Undo2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

const PostDetail: React.FC<any> = () => {
  const { documentId } = useLocalSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { onOpen } = useCarousel();
  const { coverWidth, coverHeight } = useCoverDimensions(14);
  const postQuery = useFetchPost({ documentId });

  const post = postQuery.data && {
    ...postQuery.data,
    cover: toAttachmetItem(postQuery.data.cover, postQuery.data.attachmentExtras),
    imageries: _.map(postQuery.data.attachments || [], (attachment: any) =>
      toAttachmetItem(attachment, postQuery.data.attachmentExtras),
    ),
  };

  const carouselData = post && _.concat([post.cover], post.imageries || []);

  const onCoverPress = () => onOpen(carouselData, 0);

  const onImagePress = (index: number) => onOpen(carouselData, index + (post.cover ? 1 : 0));

  const deleteMutation = useDeletePost();

  const editPublishMutation = useEditPostPublish();

  const onEdit = () => {
    router.push(`/posts/edit/${documentId}`);
  };

  const onPublish = () => {
    toast.confirm({
      description: `确定要发布吗？`,
      onConfirm: async () => {
        editPublishMutation.mutate(
          {
            documentId,
            isPublished: true,
          },
          {
            onSuccess: (data, variables) => {
              setTimeout(
                () =>
                  toast.success({
                    description: '发布成功',
                  }),
                0,
              );
            },
            onError(error, variables, context) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onUnpublish = () => {
    toast.confirm({
      description: `确定要取消发布吗？`,
      onConfirm: async () => {
        editPublishMutation.mutate(
          {
            documentId,
            isPublished: false,
          },
          {
            onSuccess: (data, variables) => {
              toast.success({
                description: '取消发布成功',
              });
            },
            onError(error, variables, context) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const onDelete = () => {
    toast.confirm({
      description: `确认要删除吗？`,
      onConfirm: async () => {
        deleteMutation.mutate(
          {
            documentId,
          },
          {
            onSuccess: () => {
              toast.success({
                description: '删除成功',
              });
              router.back();
            },
            onError(error) {
              toast.error({ description: error.message });
            },
          },
        );
      },
    });
  };

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <HStack space="md" className="items-center justify-center">
      <ShareButton />
      {_.isNil(user) || _.isNil(post)
        ? null
        : user.documentId === post.author.documentId && (
            <Menu placement="bottom" trigger={renderTrigger}>
              {post.isPublished ? (
                <MenuItem key="Unpublish" textValue="取消发布" onPress={() => onUnpublish()}>
                  <Icon as={Undo2} size="xs" className="mr-2" />
                  <MenuItemLabel size="xs">取消发布</MenuItemLabel>
                </MenuItem>
              ) : (
                <>
                  <MenuItem key="Unpublish" textValue="取消发布" onPress={() => onPublish()}>
                    <Icon as={Redo2} size="xs" className="mr-2" />
                    <MenuItemLabel size="xs">发布</MenuItemLabel>
                  </MenuItem>
                </>
              )}
              <MenuSeparator />
              <MenuItem key="Edit" textValue="编辑" onPress={() => onEdit()}>
                <Icon as={Edit} size="xs" className="mr-2" />
                <MenuItemLabel size="xs">编辑</MenuItemLabel>
              </MenuItem>
              <MenuSeparator />
              <MenuItem key="Delete" textValue="删除" onPress={() => onDelete()}>
                <Icon as={Trash} size="xs" className="mr-2" />
                <MenuItemLabel size="xs">删除</MenuItemLabel>
              </MenuItem>
            </Menu>
          )}
    </HStack>
  );

  const renderTrigger = (triggerProps: any) => {
    return (
      <TouchableOpacity {...triggerProps}>
        <Icon as={Ellipsis} />
      </TouchableOpacity>
    );
  };

  if (postQuery.data) {
    return (
      <SafeAreaView className="flex-1">
        <Stack.Screen
          options={{
            title: post.title,
            headerShown: true,
            headerLeft: renderHeaderLeft,
            headerRight: renderHeaderRight,
          }}
        />
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <VStack space="md">
            <ImageryItem
              uri={post.cover.thumbnail}
              cacheKey={post.cover.name}
              mime={post.cover.mime}
              alt={post.cover.alternativeText || post.cover.name}
              onPress={onCoverPress}
              style={{
                width: coverWidth,
                height: coverHeight,
              }}
              className="rounded-md"
            />
            <HStack className="items-center" space="sm">
              {!post.isPublished && (
                <Text size="sm" sub={true} className="text-gray-400">
                  [未发布]
                </Text>
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
                <CommentIcon postDocumentId={post.documentId} commentCount={post.comments.count} />
              </HStack>
            </HStack>
            <TagList value={post.tags} readonly={true} />
            <ImageryList value={post.imageries} onPress={onImagePress} />
            <Divider />
            <Text size="md">{post.content}</Text>
            <Divider />
            <HStack className="items-center justify-end">
              <HStack space="md" className="items-center justify-end">
                <LikeButton post={post} />
                <CommentIcon postDocumentId={post.documentId} commentCount={post.comments.count} />
              </HStack>
            </HStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <PostDetailSkeleton />;
};

const PostDetailLayout: React.FC = () => {
  return (
    <CarouselProvider>
      <CommentSheetProvider>
        <PostDetail />
        <CarouselViewer />
        <CommentSheet />
      </CommentSheetProvider>
    </CarouselProvider>
  );
};

export default PostDetailLayout;
