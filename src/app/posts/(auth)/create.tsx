import CarouselViewer from '@/components/carousel-viewer';
import PageSpinner from '@/components/page-spinner';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useCreatePost } from '@/features/post/api/use-create-post';
import PostForm, { postSchema, PostSchema } from '@/features/post/components/post-form';
import useToast from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard } from 'react-native';

const PostCreatePage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();

  const defaultValues: Partial<PostSchema> = {
    title: '',
    content: '',
    author: user.documentId,
    poi: undefined,
    cover: undefined,
    imageries: [],
    tags: [],
    attachments: [],
    attachmentExtras: [],
    isPublished: false,
  };

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues,
  });

  const { setValue, handleSubmit } = form;

  const mutation = useCreatePost();

  const onSubmit = async (formData: PostSchema) => {
    return mutation.mutate(formData, {
      onSuccess: (data, variables) => {
        toast.success({
          description: variables.isPublished ? '发布成功' : '保存成功',
        });
        router.dismiss();
      },
      onError(error, variables, context) {
        toast.error({ description: error.message });
      },
    });
  };

  const onSaveDraft = () => {
    Keyboard.dismiss();
    setValue('isPublished', false);
    handleSubmit(onSubmit)();
  };

  const onSave = () => {
    Keyboard.dismiss();
    setValue('isPublished', true);
    handleSubmit(onSubmit)();
  };

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <HStack space="sm" className="items-center">
      <Button
        size="md"
        action="secondary"
        variant="link"
        isDisabled={mutation.isPending}
        onPress={onSaveDraft}>
        <ButtonText>[存草稿]</ButtonText>
      </Button>
      <Button
        action="primary"
        size="md"
        variant="link"
        onPress={onSave}
        isDisabled={mutation.isPending}>
        <ButtonText>发布</ButtonText>
      </Button>
    </HStack>
  );

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '写帖子',
          headerShown: true,
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      />
      {mutation.isPending && <PageSpinner />}
      <>
        <PostForm form={form} />
        <CarouselViewer />
      </>
    </SafeAreaView>
  );
};

export default PostCreatePage;
