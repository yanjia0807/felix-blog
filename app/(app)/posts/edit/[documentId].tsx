import React, { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { editPost, fetchPost } from '@/api/post';
import PostForm, { postSchema, PostSchema } from '@/components/post-form';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import useCustomToast from '@/hooks/use-custom-toast';
import {
  isImage,
  isVideo,
  FileTypeNum,
  imageFormat,
  fileFullUrl,
  isAudio,
  videoThumbnailUrl,
} from '@/utils/file';
import { ErrorBoundaryAlert } from '@/components/error';

const PostEditPage = () => {
  const { documentId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const toast = useCustomToast();

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });
  const { handleSubmit, reset } = form;

  const postQuery = useQuery({
    queryKey: ['posts', 'detail', documentId],
    queryFn: () => fetchPost({ documentId }),
  });

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

  const mutation = useMutation({
    mutationFn: (data: PostSchema) => {
      return editPost(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', documentId],
      });
      toast.success({
        description: '保存成功',
      });
      router.dismiss();
    },
    onError(error, variables, context) {
      toast.error({ description: error.message });
    },
  });

  const onSubmit = async (formData: PostSchema) => {
    return mutation.mutate(formData);
  };

  const onSave = () => {
    handleSubmit(onSubmit)();
  };

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
    if (post) {
      reset(post);
    }
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
      <PostForm mode="edit" form={form} query={postQuery} mutation={mutation} />
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <ErrorBoundaryAlert error={error} retry={retry} />
);

export default PostEditPage;
