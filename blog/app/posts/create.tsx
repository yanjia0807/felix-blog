import BottomSheet from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import { AlertCircleIcon, ImageIcon, MapPinIcon, Mic, TagIcon } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, SafeAreaView } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from 'tailwindcss/colors';
import { z, ZodType } from 'zod';
import { upload } from '@/api/file';
import { createPost, PostData } from '@/api/post';
import ImagePickerSheet from '@/components/image-picker-sheet';
import LocationSheet from '@/components/location-sheet';
import PostImageGrid from '@/components/post-images-grid';
import PostRecordingSheet from '@/components/post-recording-sheet';
import PostRecordings from '@/components/post-recordings';
import PostTagSheet from '@/components/post-tag-sheet';
import PostTags from '@/components/post-tags';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import useCustomToast from '@/components/use-custom-toast';

type PostFormData = {
  title: string;
  content?: string;
};

const PostCreate = () => {
  const [images, setImages] = useState<any>([]);
  const [recordings, setRecordings] = useState<any>([]);
  const [location, setLocation] = useState<any>();
  const [tags, setTags] = useState<any>([]);
  const insets = useSafeAreaInsets();
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
  const [imageSheetIsOpen, setImageSheetIsOpen] = useState(false);
  const [galleryPreviewIsOpen, setGalleryPreviewIsOpen] = useState(false);
  const recordingSheetRef = useRef<BottomSheet>();
  const locationSheetRef = useRef<BottomSheet>();
  const tagSheetRef = useRef<BottomSheet>();

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
      author: 2,
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

  const onAddRecording = (recording: any) => {
    setRecordings((pre: any) => [...pre, recording]);
  };

  const onRemoveRecording = async (uri: string) => {
    setRecordings((pre: any) => _.filter(pre, (item) => item._uri !== uri));
  };

  const onAddTags = ({ selectedTags }: any) => {
    setTags(selectedTags);
  };

  const onRemoveTag = (tag: any) => {
    setTags((prev: any) => _.reject(prev, ['id', tag.id]));
  };

  const onOpenGallery = async (index: number) => {
    setInitialIndex(index);
    setGalleryPreviewIsOpen(true);
  };

  const renderHeaderLeft = () => (
    <Button
      size="sm"
      action="secondary"
      variant="link"
      onPress={() => {
        router.dismiss();
      }}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <HStack space="sm">
      <Button size="sm" action="secondary" variant="link">
        <ButtonText>[存草稿]</ButtonText>
      </Button>
      <Button action="primary" size="sm" variant="link" onPress={handleSubmit(onSubmit)}>
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
        <Box className="">
          <Textarea className="border-0 h-32" size="md" variant="default">
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
        </Box>

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
      <ImagePickerSheet
        isOpen={imageSheetIsOpen}
        onClose={() => {
          setImageSheetIsOpen(false);
        }}
        onChange={onAddImage}
      />
      <GalleryPreview
        images={images}
        initialIndex={initialIndex}
        isVisible={galleryPreviewIsOpen}
        onRequestClose={() => setGalleryPreviewIsOpen(false)}
      />
      <Stack.Screen
        options={{
          title: '记录',
          headerShown: true,
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      />
      <>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
          {isPending && (
            <Spinner
              size="small"
              className="absolute bottom-0 left-0 right-0 top-0"
              color={colors.gray[500]}
            />
          )}
          <Controller control={control} name="title" render={renderTitle} />
          <Controller control={control} name="content" render={renderContent} />
          <Divider className="my-2 bg-background-200" />
          {tags.length > 0 && <PostTags tags={tags} onRemoveTag={onRemoveTag} />}
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
        </KeyboardAwareScrollView>
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
          <HStack space="md" className="w-full bg-grey-50 px-4">
            <ButtonGroup space="sm">
              <Button variant="link" onPress={() => setImageSheetIsOpen(true)}>
                <ButtonIcon as={ImageIcon} />
                <ButtonText>图片</ButtonText>
              </Button>
            </ButtonGroup>
            <ButtonGroup space="sm">
              <Button
                variant="link"
                onPress={() => {
                  Keyboard.dismiss();
                  recordingSheetRef.current?.snapToIndex(0);
                }}>
                <ButtonIcon as={Mic} />
                <ButtonText>录音</ButtonText>
              </Button>
            </ButtonGroup>
            <ButtonGroup space="sm">
              <Button
                variant="link"
                onPress={() => {
                  Keyboard.dismiss();
                  locationSheetRef.current?.snapToIndex(0);
                }}>
                <ButtonIcon as={MapPinIcon} />
                <ButtonText>位置</ButtonText>
              </Button>
            </ButtonGroup>
            <ButtonGroup space="sm">
              <Button
                variant="link"
                onPress={() => {
                  Keyboard.dismiss();
                  tagSheetRef.current?.snapToIndex(0);
                }}>
                <ButtonIcon as={TagIcon} />
                <ButtonText>标签</ButtonText>
              </Button>
            </ButtonGroup>
          </HStack>
        </KeyboardStickyView>
        <PostRecordingSheet ref={recordingSheetRef} onChange={onAddRecording} />
        <PostTagSheet ref={tagSheetRef} value={tags} onChange={onAddTags} />
        <LocationSheet ref={locationSheetRef} setLocation={setLocation} />
      </>
    </SafeAreaView>
  );
};

export default PostCreate;
