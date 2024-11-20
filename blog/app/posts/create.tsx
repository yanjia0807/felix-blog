import React, { useRef, useState } from 'react';
import { Keyboard, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import { AlertCircleIcon, CircleX, ImageIcon, MapPinIcon, Mic, TagIcon } from 'lucide-react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import ImagePickerSheet from '@/components/image-picker-sheet';
import RecordingSheet from '@/components/recording-sheet';
import { Divider } from '@/components/ui/divider';
import GalleryPreview from 'react-native-gallery-preview';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import LocationSheet from '@/components/location-sheet';
import TagSheet from '@/components/tag-sheet';
import { Grid, GridItem } from '@/components/ui/grid';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RecordingBtn from '@/components/recording-btn';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodType } from 'zod';
import { Spinner } from '@/components/ui/spinner';
import colors from 'tailwindcss/colors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TagBtn from '@/components/tag-btn';
import { upload } from '@/api/file';
import { createPost, PostData } from '@/api/post';
import useCustomToast from '@/components/use-custom-toast';
import { Input, InputField } from '@/components/ui/input';

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
  const recordingSheetRef = useRef<BottomSheetModal>();
  const locationSheetRef = useRef<BottomSheetModal>();
  const tagSheetRef = useRef<BottomSheetModal>();

  const onSubmit = async (formData: PostFormData) => {
    const files = [
      ...images?.map((item: any) => item.uri),
      ...recordings?.map((item: any) => item._uri),
    ];

    const fileIds: string[] = files.length > 0 ? await upload(files) : await Promise.resolve([]);

    const postData: PostData = {
      content: formData.content,
      author: 2,
    };

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

    mutate(postData, {
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
  };

  const handleAddImage = async (images: any) => {
    setImages((pre: any) => _.unionBy(pre, images, 'assetId'));
  };

  const handleRemoveImage = async (assetId: string) => {
    setImages((pre: any) => _.filter(pre, (item) => item.assetId !== assetId));
  };

  const handleAddRecording = (recording: any) => {
    setRecordings((pre: any) => [...pre, recording]);
  };

  const handleRemoveRecording = async (uri: string) => {
    setRecordings((pre: any) => _.filter(pre, (item) => item._uri !== uri));
  };

  const handleAddTags = ({ selectedTags }: any) => {
    setTags(selectedTags);
  };

  const handleRemoveTag = (tag: any) => {
    setTags((prev: any) => _.reject(prev, ['id', tag.id]));
  };

  const handleOpenGallery = async (index: number) => {
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
      </Input>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} />
        <FormControlErrorText>{errors?.title?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderContent = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl size="md" className="h-32" isInvalid={!!errors.content}>
      <Textarea className="flex-1 border-0">
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
  );
  return (
    <>
      <ImagePickerSheet
        isOpen={imageSheetIsOpen}
        onClose={() => {
          setImageSheetIsOpen(false);
        }}
        onChange={handleAddImage}
      />
      <RecordingSheet ref={recordingSheetRef} onChange={handleAddRecording} />
      <TagSheet ref={tagSheetRef} value={tags} onChange={handleAddTags} />
      <LocationSheet ref={locationSheetRef} setLocation={setLocation} />
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
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1, padding: 16 }}>
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

          {tags.length > 0 && (
            <HStack space="sm" className="flex-wrap">
              {tags.map((item: any) => (
                <TagBtn key={item.id} tag={item} removeTag={handleRemoveTag} />
              ))}
            </HStack>
          )}

          {recordings.length > 0 && (
            <HStack space="sm" className="my-2 flex-wrap">
              {recordings.map((recording: any) => {
                return (
                  <RecordingBtn
                    key={recording.getURI()}
                    uri={recording.getURI()}
                    onRemove={handleRemoveRecording}
                  />
                );
              })}
            </HStack>
          )}

          {images.length > 0 && (
            <Grid
              className="gap-0"
              _extra={{
                className: 'grid-cols-4',
              }}>
              {images.map((image: any, index: number) => (
                <GridItem
                  key={image.assetId}
                  className="p-2"
                  _extra={{
                    className: 'col-span-1',
                  }}>
                  <TouchableOpacity
                    onPress={() => handleOpenGallery(index)}
                    key={image.assetId}
                    className="shadow-sm">
                    <Image
                      alt={image.fileName}
                      style={{
                        aspectRatio: 1,
                        borderRadius: 12,
                      }}
                      source={{
                        uri: image.uri,
                      }}
                    />
                    <TouchableOpacity
                      className="absolute right-0 top-0 m-1"
                      onPress={() => handleRemoveImage(image.assetId)}>
                      <Icon as={CircleX} size="sm" className="text-white" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </GridItem>
              ))}
            </Grid>
          )}
        </KeyboardAwareScrollView>
        <KeyboardStickyView offset={{ closed: -insets.bottom, opened: 0 }}>
          <HStack space="md" className="w-full bg-background-200 px-4">
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
                  recordingSheetRef.current?.present();
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
                  locationSheetRef.current?.present();
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
                  tagSheetRef.current?.present();
                }}>
                <ButtonIcon as={TagIcon} />
                <ButtonText>标签</ButtonText>
              </Button>
            </ButtonGroup>
          </HStack>
        </KeyboardStickyView>
      </>
    </>
  );
};

export default PostCreate;
