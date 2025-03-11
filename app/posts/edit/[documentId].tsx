import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { apiServerURL } from '@/api';
import { editPost, fetchPost } from '@/api/post';
import PostForm, { postSchema, PostSchema } from '@/components/post-form';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import useCustomToast from '@/components/use-custom-toast';
import {
  getFileType,
  isImage,
  isVideo,
  FileTypeNum,
  largeUrl,
  thumbnailUrl,
  videoUrl,
} from '@/utils/file';

const PostEdit = () => {
  const { documentId, status } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const toast = useCustomToast();

  const query = useQuery({
    queryKey: ['posts', 'detail', documentId],
    queryFn: () => fetchPost({ documentId, status }),
  });

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (query.isSuccess) {
      const { files, author, ...rest } = query.data;

      const cover = query.data.cover
        ? {
            id: query.data.cover.id,
            data: query.data.cover,
            fileType: FileTypeNum.Image,
            uri: largeUrl(query.data.cover),
            detail: {
              uri: largeUrl(query.data.cover),
            },
          }
        : undefined;

      const images = _.map(
        _.filter(query.data.files || [], (item: any) => {
          return isImage(item.file.mime) || isVideo(item.file.mime);
        }) || [],
        (item: any) => {
          if (isImage(item.file.mime)) {
            return {
              id: item.id,
              data: item,
              fileType: FileTypeNum.Image,
              uri: thumbnailUrl(item.file),
              detail: {
                uri: largeUrl(item.file),
              },
            };
          } else if (isVideo(item.file.mime)) {
            return {
              id: item.id,
              data: item,
              fileType: FileTypeNum.Video,
              uri: thumbnailUrl(item.fileInfo),
              detail: {
                uri: videoUrl(item.file),
              },
            };
          }
        },
      );

      const recordings = _.map(
        _.filter(files || [], (item: any) => getFileType(item.file.mime) === FileTypeNum.Audio),
        (item: any) => ({
          id: item.id,
          data: item,
          fileType: FileTypeNum.Audio,
          uri: `${apiServerURL}${item.file.url}`,
        }),
      );

      const post = {
        ...rest,
        author: author.documentId,
        cover,
        images,
        recordings,
        status,
      };

      form.reset(post);
    }
  }, [form, query.data, query.isSuccess, status]);

  const { setValue, handleSubmit } = form;

  const mutation = useMutation({
    mutationFn: (data: PostSchema) => editPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['posts', 'authors'] });
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
      <PostForm mode="edit" form={form} query={query} mutation={mutation} />
    </SafeAreaView>
  );
};

export default PostEdit;
