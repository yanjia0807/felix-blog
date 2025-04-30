import React, { useEffect } from 'react';
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

const PostEditPage = () => {
  const { documentId, status } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const toast = useCustomToast();

  const postQuery = useQuery({
    queryKey: ['posts', 'detail', documentId],
    queryFn: () => fetchPost({ documentId, status }),
  });

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
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
        _.filter(postData?.attachments || [], (item: any) => isAudio(item.mime)),
        (item: any) => ({
          id: item.id,
          data: item,
          fileType: FileTypeNum.Audio,
          uri: fileFullUrl(item),
        }),
      );

      form.reset({
        ...postData,
        author: postData.author.documentId,
        cover,
        images,
        recordings,
        status,
      });
    }
  }, [form, postQuery.data, postQuery.isSuccess, status]);

  const { setValue, handleSubmit } = form;

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

  function onSaveBtnPress(): void {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  }

  function onPublishBtnPress(): void {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  }

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
        action="secondary"
        variant="link"
        isDisabled={mutation.isPending}
        onPress={onSaveBtnPress}>
        <ButtonText>保存</ButtonText>
      </Button>
      {status === 'draft' && (
        <Button
          size="md"
          action="primary"
          variant="link"
          onPress={onPublishBtnPress}
          isDisabled={mutation.isPending}>
          <ButtonText>发布</ButtonText>
        </Button>
      )}
    </HStack>
  );

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

export default PostEditPage;
