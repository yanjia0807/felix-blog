import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useForm } from 'react-hook-form';
import { createPost } from '@/api/post';
import { PageFallbackUI } from '@/components/fallback';
import PageSpinner from '@/components/page-spinner';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useAuth } from '@/features/auth/components/auth-provider';
import { PagerViewProvider } from '@/features/image/components/pager-view-provider';
import PostForm, { postSchema, PostSchema } from '@/features/post/components/post-form';
import useToast from '@/hooks/use-toast';

const PostCreatePage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: PostSchema) => createPost(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      toast.success({
        description: variables.isPublished ? '发布成功' : '保存成功',
      });
      router.dismiss();
    },
    onError(error, variables, context) {
      toast.error({ description: error.message });
    },
  });

  const defaultValues: Partial<PostSchema> = {
    title: undefined,
    content: undefined,
    author: user.documentId,
    poi: undefined,
    cover: undefined,
    images: [],
    recordings: [],
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

  const onSubmit = async (formData: PostSchema) => {
    return mutation.mutate(formData);
  };

  const onSaveDraft = () => {
    setValue('isPublished', false);
    handleSubmit(onSubmit)();
  };

  const onSave = () => {
    setValue('isPublished', true);
    handleSubmit(onSubmit)();
  };

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
        isDisabled={mutation.isPending}
        onPress={onSaveDraft}>
        <ButtonText>存草稿</ButtonText>
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
      <PagerViewProvider>
        <PostForm form={form} />
      </PagerViewProvider>
    </SafeAreaView>
  );
};

export const ErrorBoundary = ({ error, retry }: any) => (
  <PageFallbackUI error={error} retry={retry} />
);

export default PostCreatePage;
