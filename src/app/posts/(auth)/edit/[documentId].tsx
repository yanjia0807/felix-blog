import React, { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { PageFallbackUI } from '@/components/fallback';
import PageSpinner from '@/components/page-spinner';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useEditPost } from '@/features/post/api/use-edit-post';
import { useFetchPost } from '@/features/post/api/use-fetch-post';
import PostForm, { postSchema, PostSchema } from '@/features/post/components/post-form';
import useToast from '@/hooks/use-toast';
import {
  isImage,
  isVideo,
  FileTypeNum,
  imageFormat,
  fileFullUrl,
  isAudio,
  videoThumbnailUrl,
} from '@/utils/file';

const PostEditPage = () => {
  const { documentId } = useLocalSearchParams();
  const toast = useToast();
  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });
  const { handleSubmit, reset } = form;

  const postQuery = useFetchPost({ documentId });

  const post = useMemo(() => {
    if (!postQuery.isSuccess) return null;

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

    const album = _.concat(cover ? [cover] : [], images);

    const recordings = _.map(
      _.filter(postData?.attachments || [], (item: any) => isAudio(item.mime)),
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
      album,
      recordings,
    };
  }, [postQuery.isSuccess, postQuery.data]);

  const mutation = useEditPost();

  const onSubmit = async (formData: PostSchema) => {
    return mutation.mutate(formData, {
      onSuccess: () => {
        toast.success({
          description: '保存成功',
        });
        router.dismiss();
      },
      onError(error) {
        toast.error({ description: error.message });
      },
    });
  };

  const onSave = () => handleSubmit(onSubmit)();

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

  const renderHeaderRight = () => (
    <HStack space="md" className="items-center">
      <Button
        size="md"
        action="primary"
        variant="link"
        isDisabled={mutation.isPending}
        onPress={onSave}>
        <ButtonText>保存</ButtonText>
      </Button>
    </HStack>
  );

  useEffect(() => {
    if (post) reset(post);
  }, [post, reset]);

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '编辑帖子',
          headerShown: true,
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      />
      {postQuery.isLoading || (mutation.isPending && <PageSpinner />)}
      <PostForm form={form} />
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default PostEditPage;
