import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { AlertCircleIcon, ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import GalleryPreview from 'react-native-gallery-preview';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { createPost } from '@/api/post';
import { useAuth } from '@/components/auth-context';
import { CoverInput, ImageGrid, ImageInput } from '@/components/image-input';
import PageSpinner from '@/components/page-spinner';
import { PositionInput } from '@/components/position-input';
import { RecordingInput } from '@/components/recording-input';
import { RecordingList } from '@/components/recording-list';
import { TagInput, TagList } from '@/components/tag-input';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

const maxCharCount = 5000;

type PostSchema = z.infer<typeof postSchema>;

const postSchema = z.object({
  title: z
    .string({
      required_error: '标题是必填项',
    })
    .min(6, '标题不能少于6个字符')
    .max(200, '标题不能超过200个字符'),
  content: z.string().max(maxCharCount, `内容最多不能超过${maxCharCount}个字符`).optional(),
  author: z.string(),
  poi: z.any(),
  cover: z.any(),
  images: z.array(z.any()),
  audios: z.array(z.any()),
  tags: z.array(z.any()),
});

const PostCreate: React.FC = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const [charCount, setCharCount] = useState(0);
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [galleryPreviewIsOpen, setGalleryPreviewIsOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostSchema>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: undefined,
      content: undefined,
      author: user.documentId,
      poi: undefined,
      cover: undefined,
      images: [],
      audios: [],
      tags: [],
    },
  });

  const { isPending, mutate } = useMutation({
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

  const onSubmit = async (formData: PostSchema) => mutate(formData);

  const formData: any = watch();

  const onRemoveRecording = async (uri: string) => {
    setValue(
      'audios',
      _.filter(formData.audios, (item: any) => item._uri !== uri),
    );
  };

  const onRemoveTag = (documentId: any) => {
    setValue(
      'tags',
      _.filter(formData.tags, (item: any) => item.documentId !== documentId),
    );
  };

  const onRemoveImage = async (uri: string) => {
    setValue(
      'images',
      _.filter(formData.images, (item: any) => item.uri !== uri),
    );
  };

  const onSetCover = async (image: any) => {
    setValue('cover', image);
  };

  const onOpenGallery = async (index: number) => {
    setInitialIndex(index);
    setGalleryPreviewIsOpen(true);
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
      <Button size="md" action="secondary" variant="link" isDisabled={isPending}>
        <ButtonText>[存草稿]</ButtonText>
      </Button>
      <Button
        action="primary"
        size="md"
        variant="link"
        onPress={handleSubmit(onSubmit)}
        isDisabled={isPending}>
        <ButtonText>发布</ButtonText>
      </Button>
    </HStack>
  );

  const renderTitle = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.title} size="md">
      <Input variant="underlined" className="border-0 border-b p-2">
        <InputField
          placeholder="请输入标题...."
          inputMode="text"
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
        <InputSlot>
          <Controller control={control} name="tags" render={renderTagInput} />
        </InputSlot>
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.title?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderCover = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.cover} size="md">
      <CoverInput value={value} onChange={onChange} />
    </FormControl>
  );

  const renderContent = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => (
      <FormControl size="md" isInvalid={!!errors.content}>
        <Textarea className="h-48 border-l-0 border-r-0 border-t-0" size="md" variant="default">
          <TextareaInput
            placeholder="你此时的感想..."
            inputMode="text"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={(props) => {
              setCharCount(props?.length);
              onChange(props);
            }}
            value={value}
          />
        </Textarea>
        <FormControlHelper className="justify-end">
          <FormControlHelperText>{`${charCount}/${maxCharCount}`}</FormControlHelperText>
        </FormControlHelper>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors?.content?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    ),
    [charCount, errors.content],
  );

  const renderTagInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.tags} size="md">
      <TagInput value={value} onChange={onChange} />
    </FormControl>
  );

  const renderImagesInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.images} size="md">
      <ImageInput value={value} onChange={onChange} />
    </FormControl>
  );

  const renderAudiosInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.audios} size="md">
      <RecordingInput value={value} onChange={onChange} />
    </FormControl>
  );

  const renderPosition = ({ field: { onChange, onBlur, value } }: any) => (
    <PositionInput value={value} onChange={onChange} />
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
      <>
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1, padding: 16 }}>
          <VStack className="flex-1" space="lg">
            <PageSpinner isVisiable={isPending} />
            <Controller control={control} name="cover" render={renderCover} />
            <Controller control={control} name="title" render={renderTitle} />
            <TagList tags={formData.tags} onRemove={onRemoveTag} />
            <Controller control={control} name="content" render={renderContent} />
            <HStack className="justify-end">
              <Controller control={control} name="poi" render={renderPosition} />
            </HStack>
            <RecordingList recordings={formData.audios} onRemove={onRemoveRecording} />
            <ImageGrid
              images={formData.images}
              onOpenGallery={onOpenGallery}
              onRemove={onRemoveImage}
              onSetCover={onSetCover}
            />
          </VStack>
        </KeyboardAwareScrollView>
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
          <HStack space="md" className="w-full bg-background-200 px-4">
            <Controller control={control} name="images" render={renderImagesInput} />
            <Controller control={control} name="audios" render={renderAudiosInput} />
          </HStack>
        </KeyboardStickyView>
        <GalleryPreview
          images={formData.images || []}
          initialIndex={initialIndex}
          isVisible={galleryPreviewIsOpen}
          onRequestClose={() => setGalleryPreviewIsOpen(false)}
        />
      </>
    </SafeAreaView>
  );
};

export default PostCreate;
