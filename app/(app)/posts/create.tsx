import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { createPost } from '@/api/post';
import { useAuth } from '@/components/auth-provider';
import PostForm, { postSchema, PostSchema } from '@/components/post-form';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import useCustomToast from '@/hooks/use-custom-toast';

const PostCreatePage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: (data: PostSchema) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      toast.success({
        description: '保存成功',
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
    status: 'published',
    attachments: [],
    attachmentExtras: [],
  };

  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues,
  });

  const { setValue, handleSubmit } = form;

  const onSubmit = async (formData: PostSchema) => {
    return mutation.mutate(formData);
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
        action="secondary"
        variant="link"
        isDisabled={mutation.isPending}
        onPress={onSaveDraftBtnPress}>
        <ButtonText>[存草稿]</ButtonText>
      </Button>
      <Button
        action="primary"
        size="md"
        variant="link"
        onPress={onSaveBtnPress}
        isDisabled={mutation.isPending}>
        <ButtonText>发布</ButtonText>
      </Button>
    </HStack>
  );

  function onSaveDraftBtnPress(): void {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  }

  function onSaveBtnPress(): void {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  }

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
      <PostForm mode="create" form={form} mutation={mutation} />
    </SafeAreaView>
  );
};

export default PostCreatePage;
