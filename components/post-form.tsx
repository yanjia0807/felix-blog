import React, { useCallback, useState } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react-native';
import { Controller, UseFormReturn } from 'react-hook-form';
import GalleryPreview from 'react-native-gallery-preview';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { CoverInput, ImageGrid, ImageInput } from './image-input';
import PageSpinner from './page-spinner';
import { PositionInput } from './position-input';
import { RecordingInput, RecordingList } from './recording-input';
import { TagInput, TagList } from './tag-input';
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from './ui/form-control';
import { HStack } from './ui/hstack';
import { Input, InputField, InputSlot } from './ui/input';
import { Textarea, TextareaInput } from './ui/textarea';
import { VStack } from './ui/vstack';
import _ from 'lodash';

const maxCharCount = 5000;

export type PostSchema = z.infer<typeof postSchema>;

export const postSchema = z.object({
  id: z.any(),
  documentId: z.any(),
  title: z
    .string({
      required_error: '标题是必填项',
    })
    .min(2, '标题不能少于2个字符')
    .max(200, '标题不能超过200个字符'),
  content: z.string().max(maxCharCount, `内容最多不能超过${maxCharCount}个字符`).optional(),
  author: z.string(),
  poi: z.any(),
  cover: z.any(),
  images: z.array(z.any()),
  recordings: z.array(z.any()),
  tags: z.array(z.any()),
  status: z.enum(['draft', 'published']),
});

type PostFormProps = {
  mode: 'create' | 'edit';
  form: UseFormReturn<PostSchema, any, undefined>;
  query?: UseQueryResult<any, Error>;
  mutation: UseMutationResult<any, Error, PostSchema, unknown>;
};

const PostForm = ({ mode, form, query, mutation }: PostFormProps) => {
  const insets = useSafeAreaInsets();
  const [charCount, setCharCount] = useState(0);
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [galleryPreviewIsOpen, setGalleryPreviewIsOpen] = useState(false);

  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const formData: any = watch();
  const galleryImages: any = _.concat(
    [],
    formData?.cover
      ? {
          ...formData.cover,
          uri: formData.cover.largeUri || formData.cover.uri,
        }
      : [],
    formData?.images
      ? formData.images.map((item: any) => ({
          ...item,
          uri: item.largeUri || item.uri,
        }))
      : [],
  );

  const onOpenGallery = async (index: number) => {
    setInitialIndex(index);
    setGalleryPreviewIsOpen(true);
  };

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
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{errors?.title?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderCover = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.cover} size="md">
      <CoverInput value={value} onChange={onChange} onOpenGallery={onOpenGallery} />
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
            onChangeText={(props: any) => {
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
          <FormControlErrorIcon as={AlertCircle} />
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

  const renderTagList = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.tags} size="md">
      <TagList value={value} onChange={onChange} />
    </FormControl>
  );

  const renderImagesInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.images} size="md">
      <ImageInput value={value} onChange={onChange} />
    </FormControl>
  );

  const renderImageGrid = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.images} size="md">
      <ImageGrid
        value={value}
        cover={formData.cover}
        onChange={onChange}
        onOpenGallery={onOpenGallery}
      />
    </FormControl>
  );

  const renderRecordingsInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.recordings} size="md">
      <RecordingInput value={value} onChange={onChange} />
    </FormControl>
  );

  const renderRecordingList = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors.recordings} size="md">
      <RecordingList value={value} onChange={onChange} />
    </FormControl>
  );

  const renderPosition = ({ field: { onChange, onBlur, value } }: any) => (
    <PositionInput value={value} onChange={onChange} />
  );

  return (
    <>
      <PageSpinner isVisiable={(mode === 'edit' && query?.isLoading) || mutation.isPending} />
      {(mode === 'create' || (mode === 'edit' && query?.isSuccess)) && (
        <>
          <KeyboardAwareScrollView contentContainerStyle={{ flex: 1, padding: 16 }}>
            <VStack space="lg">
              <Controller control={control} name="cover" render={renderCover} />
              <Controller control={control} name="title" render={renderTitle} />
              <Controller control={control} name="tags" render={renderTagList} />
              <Controller control={control} name="content" render={renderContent} />
              <HStack className="justify-end">
                <Controller control={control} name="poi" render={renderPosition} />
              </HStack>
              <Controller control={control} name="images" render={renderImageGrid} />
              <Controller control={control} name="recordings" render={renderRecordingList} />
            </VStack>
          </KeyboardAwareScrollView>
          <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
            <HStack space="md" className="w-full bg-background-100 px-4">
              <Controller control={control} name="images" render={renderImagesInput} />
              <Controller control={control} name="recordings" render={renderRecordingsInput} />
            </HStack>
          </KeyboardStickyView>
          <GalleryPreview
            images={galleryImages}
            initialIndex={initialIndex}
            isVisible={galleryPreviewIsOpen}
            onRequestClose={() => setGalleryPreviewIsOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default PostForm;
