import BottomSheet from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { AlertCircleIcon, ChevronLeft, ImageIcon, MapPinIcon, Mic, Tag } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z, ZodType } from 'zod';
import { upload } from '@/api/file';
import { createPost, PostData } from '@/api/post';
import { useAuth } from '@/components/auth-context';
import PostImageSheet from '@/components/post-image-sheet';
import PostImageGrid from '@/components/post-images-grid';
import PostPositionSheet from '@/components/post-position-sheet';
import PostRecordingSheet from '@/components/post-recording-sheet';
import PostRecordings from '@/components/post-recordings';
import PostTagSheet from '@/components/post-tag-sheet';
import PostTags from '@/components/post-tags';
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
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
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
  const recordingSheetRef = useRef<BottomSheet>(null);
  const tagSheetRef = useRef<BottomSheet>(null);
  const positionSheetRef = useRef<BottomSheet>(null);
  const imageSheetRef = useRef<BottomSheet>(null);

  const { isSuccess, isError, isPending, mutate } = useMutation({
    mutationFn: (data: PostData) => {
      return createPost(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('保存成功');
      router.dismiss();
    },
    onError(error, variables, context) {
      toast.error(error.message);
      console.error(error);
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
  const [isRecordingSheetOpen, setIsRecordingSheetOpen] = useState<boolean>(false);
  const [isImageSheetOpen, setIsImageSheetOpen] = useState(false);
  const [isTagSheetOpen, setIsTagSheetOpen] = useState<boolean>(false);
  const [isPositionSheetOpen, setIsPositionSheetOpen] = useState<boolean>(false);
  const [galleryPreviewIsOpen, setGalleryPreviewIsOpen] = useState(false);

  const onSubmit = async (formData: PostFormData) => {
    let coverId = null;
    let fileIds: string[] = [];

    if (images.length > 0) {
      const ids = await upload(_.map(images, (item: any) => item.uri));
      let coverIndex = _.findIndex(images, (item: any) => item.cover);
      if (coverIndex < 0) coverIndex = 0;
      fileIds = _.concat(fileIds, ids);
      coverId = ids[coverIndex];
    }

    if (recordings.length > 0) {
      const ids = await upload(_.map(recordings, (item: any) => item._uri));
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

  const onAddImage = async (images: any) => {
    setImages((pre: any) => _.unionBy(pre, images, 'assetId'));
  };

  const onRemoveImage = async (assetId: string) => {
    setImages((pre: any) => _.filter(pre, (item) => item.assetId !== assetId));
  };

  const onSetCover = async (assetId: string) => {
    setImages((pre: any) =>
      _.map(pre, (item) => {
        if (item.assetId === assetId) {
          return { ...item, cover: true };
        } else {
          return { ...item, cover: false };
        }
      }),
    );
  };

  const onAddRecording = useCallback((recording: any) => {
    setRecordings((pre: any) => [...pre, recording]);
  }, []);

  const onRemoveRecording = async (uri: string) => {
    setRecordings((pre: any) => _.filter(pre, (item) => item._uri !== uri));
  };

  const onAddTags = useCallback(({ selectedTags }: any) => {
    setTags(selectedTags);
  }, []);

  const onRemoveTag = (tag: any) => {
    setTags((prev: any) => _.filter(prev, (item: any) => item.id !== tag.id));
  };

  const onAddPosition = useCallback((position: any) => {
    setPosition(position);
  }, []);

  const onOpenGallery = async (index: number) => {
    setInitialIndex(index);
    setGalleryPreviewIsOpen(true);
  };

  const renderHeaderLeft = () => (
    <Button
      variant="link"
      onPress={() => {
        router.dismiss();
      }}>
      <ButtonIcon as={ChevronLeft} />
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

  const renderTitle = useCallback(
    ({ field: { onChange, onBlur, value } }: any) => (
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
            <Pressable onPress={() => tagSheetRef.current?.expand()}>
              <InputIcon as={Tag}></InputIcon>
            </Pressable>
          </InputSlot>
        </Input>
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{errors?.title?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>
    ),
    [errors.title],
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
            {tags.length > 0 && <PostTags tags={tags} onRemoveTag={onRemoveTag} />}
            <Controller control={control} name="content" render={renderContent} />
            <HStack className="justify-end">
              <Button
                variant="link"
                action="secondary"
                onPress={() => positionSheetRef.current?.expand()}>
                <ButtonIcon as={MapPinIcon} />
                {position ? (
                  <ButtonText>{position.name}</ButtonText>
                ) : (
                  <ButtonText>位置</ButtonText>
                )}
              </Button>
            </HStack>
            {recordings.length > 0 && (
              <PostRecordings recordings={recordings} onRemoveRecording={onRemoveRecording} />
            )}
            {images.length > 0 && (
              <PostImageGrid
                images={images}
                onOpenGallery={onOpenGallery}
                onRemoveImage={onRemoveImage}
                onSetCover={onSetCover}
              />
            )}
          </VStack>
        </KeyboardAwareScrollView>
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
          <HStack space="md" className="w-full px-4">
            <ButtonGroup space="sm">
              <Button
                variant="link"
                action="secondary"
                onPress={() => imageSheetRef.current?.expand()}>
                <ButtonIcon as={ImageIcon} />
                <ButtonText>图片</ButtonText>
              </Button>
            </ButtonGroup>
            <ButtonGroup space="sm">
              <Button
                variant="link"
                action="secondary"
                onPress={() => recordingSheetRef.current?.expand()}>
                <ButtonIcon as={Mic} />
                <ButtonText>录音</ButtonText>
              </Button>
            </ButtonGroup>
          </HStack>
        </KeyboardStickyView>
        <PostRecordingSheet ref={recordingSheetRef} onChange={onAddRecording} />
        <PostTagSheet ref={tagSheetRef} value={tags} onChange={onAddTags} />
        <PostPositionSheet ref={positionSheetRef} onChange={onAddPosition} />
        <PostImageSheet ref={imageSheetRef} onChange={onAddImage} />
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
