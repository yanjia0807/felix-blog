import PageSpinner from '@/components/page-spinner';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { CarouselProvider } from '@/features/image/components/carousel-provider';
import CarouselViewer from '@/features/image/components/carousel-viewer';
import { useEditPost } from '@/features/post/api/use-edit-post';
import { useFetchPost } from '@/features/post/api/use-fetch-post';
import PostForm, { postSchema, PostSchema } from '@/features/post/components/post-form';
import useToast from '@/hooks/use-toast';
import { toAttachmetItem } from '@/utils/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

const PostEditPage = () => {
  const { documentId } = useLocalSearchParams();
  const toast = useToast();
  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });
  const { handleSubmit, reset } = form;

  const postQuery = useFetchPost({ documentId });

  const post = useMemo(() => {
    if (!postQuery.data) return null;
    const postData = postQuery.data;

    let cover = postData.cover
      ? toAttachmetItem(postData.cover, postData.attachmentExtras)
      : undefined;

    const images = _.map(
      _.filter(
        postData.attachments || [],
        (item: any) => _.startsWith(item.mime, 'image') || _.startsWith(item.mime, 'video'),
      ) || [],
      (item: any) => toAttachmetItem(item, postData.attachmentExtras),
    );

    const album = _.concat(cover ? [cover] : [], images);

    return {
      ...postData,
      cover,
      images,
      album,
    };
  }, [postQuery.data]);

  const editMutation = useEditPost();

  const onSubmit = async (formData: PostSchema) => {
    return editMutation.mutate(formData, {
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
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <HStack space="md" className="items-center">
      <Button
        size="md"
        action="primary"
        variant="link"
        isDisabled={editMutation.isPending}
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
      {(postQuery.isLoading || editMutation.isPending) && <PageSpinner />}
      <CarouselProvider>
        <PostForm form={form} />
        <CarouselViewer />
      </CarouselProvider>
    </SafeAreaView>
  );
};

export default PostEditPage;
