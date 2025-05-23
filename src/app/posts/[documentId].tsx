import React, { useEffect, useMemo } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { Edit, Ellipsis, Redo2, StickyNote, Trash, Undo2 } from 'lucide-react-native';
import { ScrollView, TouchableOpacity } from 'react-native';
import { PageFallbackUI } from '@/components/fallback';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Menu, MenuItem, MenuItemLabel, MenuSeparator } from '@/components/ui/menu';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { CommentSheet } from '@/features/comment/components/comment-sheet';
import { CommentSheetProvider } from '@/features/comment/components/comment-sheet-provider';
import { PagerViewProvider, usePagerView } from '@/features/image/components/pager-view-provider';
import { useDeletePost } from '@/features/post/api/use-delete-post';
import { useEditPostPublish } from '@/features/post/api/use-edit-post-publish';
import { useFetchPost } from '@/features/post/api/use-fetch-post';
import { PostDetailItem, PostDetailSkeleton } from '@/features/post/components/post-detail-item';
import { ShareButton } from '@/features/post/components/share-button';
import useToast from '@/hooks/use-toast';
import { isImage, isVideo, FileTypeNum, fileFullUrl, isAudio, toAttachmetItem } from '@/utils/file';

const PostDetail: React.FC = () => {
  const { user } = useAuth();
  const { documentId } = useLocalSearchParams();
  const { setPages } = usePagerView();
  const toast = useToast();
  const postQuery = useFetchPost({ documentId });

  const post = useMemo(() => {
    if (postQuery.isSuccess) {
      const postData = postQuery.data;
      const cover = postData.cover
        ? toAttachmetItem(postData.cover, postData.attachmentExtras)
        : undefined;

      const images = _.map(
        _.filter(
          postData.attachments || [],
          (item: any) => isImage(item.mime) || isVideo(item.mime),
        ) || [],
        (attachment: any) => toAttachmetItem(attachment, postData.attachmentExtras),
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

  const deleteMutation = useDeletePost();

  const editPublishMutation = useEditPostPublish();

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

  const onPublish = () => {
    toast.confirm({
      description: `确定要发布吗？`,
      onConfirm: async () => {
        toast.close();
        editPublishMutation.mutate(
          {
            documentId,
            isPublished: true,
          },
          {
            onSuccess: (data, variables) => {
              toast.success({
                description: '发布成功',
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

  const onUnpublish = () => {
    toast.confirm({
      description: `确定要取消发布吗？`,
      onConfirm: async () => {
        toast.close();
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
        toast.close();
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
      {postQuery.isLoading && <PostDetailSkeleton />}
      {postQuery.isSuccess && (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
          <VStack className="flex-1 p-4" space="lg">
            <PostDetailItem post={post} />
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const PostDetailPage: React.FC = () => (
  <PagerViewProvider>
    <CommentSheetProvider>
      <PostDetail />
      <CommentSheet />
    </CommentSheetProvider>
  </PagerViewProvider>
);

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default PostDetailPage;
