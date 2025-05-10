import React, { memo, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import {
  ChevronLeft,
  Edit,
  Ellipsis,
  MapPin,
  Redo2,
  StickyNote,
  Trash,
  Undo2,
} from 'lucide-react-native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { deletePost, fetchPost, editPublish } from '@/api/post';
import { useAuth } from '@/components/auth-provider';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { PageFallbackUI } from '@/components/fallback';
import { ImageCover, ImageList, VideoCover } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import PageSpinner from '@/components/page-spinner';
import { PagerViewProvider, usePagerView } from '@/components/pager-view';
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
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { UserAvatar } from '@/components/user';
import useCoverDimensions from '@/hooks/use-cover-dimensions';
import useToast from '@/hooks/use-custom-toast';
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

const PostItem: React.FC<any> = memo(({ post }) => {
  const { onOpenPage } = usePagerView();
  const { coverWidth, coverHeight } = useCoverDimensions(14);

  const onCoverPress = () => onOpenPage(0);

  const onImagePress = (index: number) => onOpenPage(index + (post.cover ? 1 : 0));

  return (
    <>
      {post.cover && isImage(post.cover.mime) && (
        <ImageCover item={post} width={coverWidth} height={coverHeight} onPress={onCoverPress} />
      )}
      {post.cover && isVideo(post.cover.mime) && (
        <VideoCover item={post} width={coverWidth} height={coverHeight} onPress={onCoverPress} />
      )}
      <HStack className="items-center justify-between" space="xl">
        <Heading size="lg" className="flex-1">
          {post.title}
        </Heading>
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
          <CommentIcon post={post} />
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
          <CommentIcon post={post} />
        </HStack>
      </HStack>
    </>
  );
});

const PostSkeleton: React.FC<any> = () => {
  const { coverWidth, coverHeight } = useCoverDimensions(14);

  return (
    <>
      <PageSpinner />
      <VStack className="flex-1 p-4" space="lg">
        <Skeleton variant="rounded" style={{ width: coverWidth, height: coverHeight }} />
        <SkeletonText _lines={1} className="h-4 w-96" />
        <SkeletonText _lines={1} className="h-3 w-24" />
        <HStack className="items-center justify-between">
          <HStack className="w-24 items-center" space="xs">
            <Skeleton variant="circular" className="h-8 w-8" />
            <SkeletonText _lines={1} className="h-4" />
          </HStack>
          <Skeleton variant="sharp" className="h-4 w-24" />
        </HStack>
        <HStack className="items-center" space="sm">
          <Skeleton variant="rounded" className="h-14 w-14" />
          <Skeleton variant="rounded" className="h-14 w-14" />
        </HStack>
        <SkeletonText _lines={3} className="h-3" />
      </VStack>
    </>
  );
};

const PostDetail: React.FC = () => {
  const { user } = useAuth();
  const { documentId } = useLocalSearchParams();
  const { setPages } = usePagerView();
  const queryClient = useQueryClient();
  const toast = useToast();

  const postQuery = useQuery({
    queryKey: ['posts', 'detail', documentId],
    queryFn: () => fetchPost({ documentId }),
  });

  const post = useMemo(() => {
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

      const recordings = _.map(
        _.filter(postData.attachments || [], (item: any) => isAudio(item.mime)),
        (item: any) => ({
          id: item.id,
          data: item,
          fileType: FileTypeNum.Audio,
          uri: fileFullUrl(item),
        }),
      );

      return {
        ...postData,
        cover,
        images,
        recordings,
      };
    }
  }, [postQuery.data, postQuery.isSuccess]);

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

  const editPublishMutation = useMutation({
    mutationFn: ({ documentId, isPublished }: any) => editPublish({ documentId, isPublished }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', documentId],
      });
      toast.success({
        description: variables.isPublished ? '发布成功' : '取消发布成功',
      });
    },
    onError(error, variables, context) {
      toast.close();
      toast.error({ description: error.message });
    },
  });

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <HStack space="md" className="items-center justify-center">
      {_.isNil(post)
        ? null
        : post.isPublished && (
            <HStack className="items-center" space="xs">
              <Icon as={StickyNote} size="sm" />
              <Text size="sm" className="text-gray-400">
                未发布
              </Text>
            </HStack>
          )}
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

  const onEdit = () => {
    router.push(`/posts/edit/${documentId}`);
  };

  const onUnpublish = () => {
    toast.confirm({
      description: `确定要取消发布吗？`,
      onConfirm: async () => {
        toast.close();
        editPublishMutation.mutate({
          documentId,
          isPublished: false,
        });
      },
    });
  };

  const onPublish = () => {
    toast.confirm({
      description: `确定要发布吗？`,
      onConfirm: async () => {
        toast.close();
        editPublishMutation.mutate({
          documentId,
          isPublished: true,
        });
      },
    });
  };

  const onDelete = () => {
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

  useEffect(() => {
    if (post) setPages(_.concat(post.cover ? post.cover : [], post.images));
  }, [post, setPages]);

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
      {postQuery.isLoading && <PostSkeleton />}
      {postQuery.isSuccess && (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
          <VStack className="flex-1 p-4" space="lg">
            <PostItem post={post} />
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const PostDetailPage: React.FC = () => (
  <CommentProvider>
    <PagerViewProvider>
      <PostDetail />
    </PagerViewProvider>
    <CommentSheet />
  </CommentProvider>
);

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default PostDetailPage;
