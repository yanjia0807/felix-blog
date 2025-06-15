import { CarouselProvider } from '@/components/carousel-provider';
import CarouselViewer from '@/components/carousel-viewer';
import PageSpinner from '@/components/page-spinner';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { useEditPost } from '@/features/post/api/use-edit-post';
import { useFetchPost } from '@/features/post/api/use-fetch-post';
import PostForm, { postSchema, PostSchema } from '@/features/post/components/post-form';
import useToast from '@/hooks/use-toast';
import { toAttachmetItem } from '@/utils/file';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const PostEditPage = () => {
  const { documentId } = useLocalSearchParams();
  const toast = useToast();
  const form = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
  });
  const { handleSubmit, reset } = form;

  const postQuery = useFetchPost({ documentId });

  const post = React.useMemo(() => {
    return (
      postQuery.data && {
        ...postQuery.data,
        cover: toAttachmetItem(postQuery.data.cover, postQuery.data.attachmentExtras),
        imageries: _.map(postQuery.data.attachments || [], (attachment: any) =>
          toAttachmetItem(attachment, postQuery.data.attachmentExtras),
        ),
      }
    );
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
      <Button action="primary" variant="link" isDisabled={editMutation.isPending} onPress={onSave}>
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
          headerShown: true,
          title: '编辑帖子',
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
