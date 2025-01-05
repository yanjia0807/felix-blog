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
import { z, ZodType } from 'zod';
import { uploadFiles } from '@/api/file';
import { createPost, PostData } from '@/api/post';
import { useAuth } from '@/components/auth-context';
import { ImageGrid, ImageInput } from '@/components/image-input';
import { PositionInput } from '@/components/position-input';
import { RecordingInput } from '@/components/recording-input';
import { RecordingList } from '@/components/recording-list';
import { TagInput } from '@/components/tag-input';
import { TagList } from '@/components/tag-list';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import useCustomToast from '@/components/use-custom-toast';

type PostFormData = {
  title: string;
  content?: string;
};

const PostCreate = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<any>([]);
  const [recordings, setRecordings] = useState<any>([]);
  const [position, setPosition] = useState<any>();
  const [tags, setTags] = useState<any>([]);
  const insets = useSafeAreaInsets();

  const { isSuccess, isError, isPending, mutate } = useMutation({
    mutationFn: (data: PostData) => {
      return createPost(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success({
        description: '保存成功',
      });
      router.dismiss();
    },
    onError(error, variables, context) {
      toast.error({ description: error.message });
    },
  });
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const maxCharCount = 5000;
  const [charCount, setCharCount] = useState(0);
  const PostSchema: ZodType<PostFormData> = z.object({
    title: z
      .string({
        required_error: '标题是必填项',
      })
      .min(6, '标题不能少于6个字符')
      .max(50, '标题不能多余501个字符'),
    content: z.string().max(maxCharCount, `内容最多不能超过${maxCharCount}个字符`).optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(PostSchema),
  });

  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [galleryPreviewIsOpen, setGalleryPreviewIsOpen] = useState(false);

  const onSubmit = async (formData: PostFormData) => {
    let coverId = null;
    let fileIds: string[] = [];

    if (images.length > 0) {
      const ids = await uploadFiles(_.map(images, (item: any) => item.uri));
      let coverIndex = _.findIndex(images, (item: any) => item.cover);
      if (coverIndex < 0) coverIndex = 0;
      fileIds = _.concat(fileIds, ids);
      coverId = ids[coverIndex];
    }

    if (recordings.length > 0) {
      const ids = await uploadFiles(_.map(recordings, (item: any) => item._uri));
      fileIds = _.concat(fileIds, ids);
    }

    const postData: PostData = {
      title: formData.title,
      content: formData.content,
      author: user.documentId,
    };

    if (coverId !== null) {
      postData.cover = coverId;
    }

    if (fileIds.length > 0) {
      postData.blocks = [
        {
          __component: 'shared.attachment',
          files: fileIds,
        },
      ];
    }

    if (tags.length > 0) {
      postData.tags = _.map(tags, 'id');
    }

    mutate(postData);
  };

  const onImageChange = async (images: any) => {
    const uris = _.isArray(images)
      ? images.map((item) => ({ uri: item.uri }))
      : [{ uri: images.uri }];
    setImages((pre: any) => _.unionBy(pre, uris, 'uri'));
  };

  const onImageRemove = async (uri: string) => {
    setImages((pre: any) => _.filter(pre, (item) => item.uri !== uri));
  };

  const onSetCover = async (uri: string) => {
    setImages((pre: any) =>
      _.map(pre, (item) => {
        if (item.uri === uri) {
          return { ...item, cover: true };
        } else {
          return { ...item, cover: false };
        }
      }),
    );
  };

  const onRecordingChange = useCallback((recording: any) => {
    setRecordings((pre: any) => [...pre, recording]);
  }, []);

  const onRecordingRemove = async (uri: string) => {
    setRecordings((pre: any) => _.filter(pre, (item) => item._uri !== uri));
  };

  const onTagChange = (newTags: any) => {
    setTags([...newTags]);
  };

  const onTagRemove = (tagId: any) => {
    setTags((prev: any) => _.filter(prev, (item: any) => item.id !== tagId));
  };

  const onPositionChange = (position: any) => {
    setPosition(position);
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
      <Button size="sm" action="secondary" variant="link">
        <ButtonText>[存草稿]</ButtonText>
      </Button>
      <Button action="primary" size="md" variant="link" onPress={handleSubmit(onSubmit)}>
        <ButtonText>发布</ButtonText>
      </Button>
    </HStack>
  );

  const renderTitle = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.title} size="md">
      <Input variant="underlined" className="border-0 border-b p-2">
        <InputField
          placeholder="请输入标题"
          inputMode="text"
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
        />
        <InputSlot>
          <TagInput value={tags} onChange={onTagChange} />
        </InputSlot>
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.title?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderContent = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => (
      <FormControl size="md" isInvalid={!!errors.content}>
        <Textarea className="h-32 border-l-0 border-r-0 border-t-0" size="md" variant="default">
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
          <VStack className="flex-1" space="xl">
            {isPending && (
              <Spinner size="small" className="absolute bottom-0 left-0 right-0 top-0" />
            )}
            <Controller control={control} name="title" render={renderTitle} />
            {tags.length > 0 && <TagList tags={tags} onRemove={onTagRemove} />}
            <Controller control={control} name="content" render={renderContent} />
            <HStack className="justify-end">
              <PositionInput value={position} onChange={onPositionChange} />
            </HStack>
            {recordings.length > 0 && (
              <RecordingList recordings={recordings} onRecordingRemove={onRecordingRemove} />
            )}
            {images.length > 0 && (
              <ImageGrid
                images={images}
                onOpenGallery={onOpenGallery}
                onRemove={onImageRemove}
                onSetCover={onSetCover}
              />
            )}
          </VStack>
        </KeyboardAwareScrollView>
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
          <HStack space="md" className="w-full px-4">
            <ButtonGroup space="sm">
              <ImageInput onChange={onImageChange} />
            </ButtonGroup>
            <ButtonGroup space="sm">
              <RecordingInput onChange={onRecordingChange} />
            </ButtonGroup>
          </HStack>
        </KeyboardStickyView>
        <GalleryPreview
          images={images || []}
          initialIndex={initialIndex}
          isVisible={galleryPreviewIsOpen}
          onRequestClose={() => setGalleryPreviewIsOpen(false)}
        />
      </>
    </SafeAreaView>
  );
};

export default PostCreate;
