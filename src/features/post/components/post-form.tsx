import React, { memo, useEffect, useState } from 'react';
import _ from 'lodash';
import { AlertCircle } from 'lucide-react-native';
import { Controller, UseFormReturn } from 'react-hook-form';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
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
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { ImageGrid } from '@/features/image/components/image-grid';
import { ImageInput } from '@/features/image/components/image-input';
import { usePagerView } from '@/features/image/components/pager-view-provider';
import { PositionInput } from '@/features/position/components/position-input';
import { RecordingInput } from '@/features/recording/components/recording-input';
import { RecordingList } from '@/features/recording/components/recording-list';
import { TagInput } from '@/features/tag/components/tag-input';
import { TagList } from '@/features/tag/components/tag-list';
import { CoverInput } from './cover-input';

const MAX_CHARS = 5000;

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
  content: z.string().max(MAX_CHARS, `内容最多不能超过${MAX_CHARS}个字符`).optional().nullable(),
  author: z.any(),
  poi: z.any(),
  cover: z
    .unknown({})
    .refine((val) => val !== null && val !== undefined, { message: '封面不能为空' }),
  images: z.array(z.any()),
  recordings: z.array(z.any()),
  tags: z.array(z.any()),
  isPublished: z.boolean(),
  attachments: z.array(z.any()).optional().nullable(),
  attachmentExtras: z.array(z.any()).optional().nullable(),
});

type PostFormProps = {
  form: UseFormReturn<PostSchema, any, undefined>;
};

const TextContent: React.FC<any> = memo(({ error, value, onChange, onBlur }) => {
  const [charCount, setCharCount] = useState(0);

  const onChangeText = (props: any) => {
    setCharCount(props?.length);
    onChange(props);
  };

  return (
    <FormControl size="md" isInvalid={!!error}>
      <Textarea className="h-48 border-l-0 border-r-0 border-t-0" size="md" variant="default">
        <TextareaInput
          placeholder="你此时的感想..."
          inputMode="text"
          autoCapitalize="none"
          onBlur={onBlur}
          onChangeText={onChangeText}
          value={value}
        />
      </Textarea>
      <FormControlHelper className="justify-end">
        <FormControlHelperText>{`${charCount}/${MAX_CHARS}`}</FormControlHelperText>
      </FormControlHelper>
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{error?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
});

const PostForm: React.FC<PostFormProps> = ({ form }) => {
  const insets = useSafeAreaInsets();
  const { onOpenPage, setPages } = usePagerView();

  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const formData: any = watch();

  const onCoverPress = () => onOpenPage(0);

  const onImagePress = (index: number) => onOpenPage(index + (formData?.cover ? 1 : 0));

  const renderTitle = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors?.title} size="md">
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
    <FormControl isInvalid={!!errors?.cover} size="md">
      <CoverInput value={value} onChange={onChange} onPress={onCoverPress} />
      <FormControlError>
        <FormControlErrorIcon as={AlertCircle} />
        <FormControlErrorText>{errors?.cover?.message}</FormControlErrorText>
      </FormControlError>
    </FormControl>
  );

  const renderContent = ({ field: { onChange, onBlur, value } }: any) => (
    <TextContent onChange={onChange} value={value} error={errors?.content} />
  );

  const renderTagInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors?.tags} size="md">
      <TagInput value={value} onChange={onChange} />
    </FormControl>
  );

  const renderTagList = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors?.tags} size="md">
      <TagList value={value} onChange={onChange} />
    </FormControl>
  );

  const renderImagesInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors?.images} size="md">
      <ImageInput value={value} onChange={onChange} />
    </FormControl>
  );

  const renderImageGrid = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors?.images} size="md">
      <ImageGrid value={value} onChange={onChange} onPress={onImagePress} />
    </FormControl>
  );

  const renderRecordingsInput = ({ field: { onChange, onBlur, value } }: any) => (
    <FormControl isInvalid={!!errors?.recordings} size="md">
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

  useEffect(() => {
    setPages(_.concat(formData?.cover || [], formData?.images || []));
  }, [formData.cover, formData.images, setPages]);

  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}>
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
    </>
  );
};

export default PostForm;
