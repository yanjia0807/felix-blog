import React, { useEffect } from 'react';
import _ from 'lodash';
import { Controller, UseFormReturn } from 'react-hook-form';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { ImageGrid } from '@/features/image/components/image-grid';
import { ImageInput } from '@/features/image/components/image-input';
import { usePagerView } from '@/features/image/components/pager-view-provider';
import { PositionInput } from '@/features/position/components/position-input';
import { RecordingInput } from '@/features/recording/components/recording-input';
import { RecordingList } from '@/features/recording/components/recording-list';
import { TagList } from '@/features/tag/components/tag-list';
import { CoverInput } from './cover-input';
import { MAX_CHARS, PostContentInput } from './post-content-input';
import { PostTitleInput } from './post-title-input';

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
    .refine((val) => val !== null && val !== undefined, { message: '封面是必填项' }),
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
    <PostTitleInput onChange={onChange} value={value} error={errors?.title} control={control} />
  );

  const renderCover = ({ field: { onChange, onBlur, value } }: any) => (
    <CoverInput value={value} onChange={onChange} onPress={onCoverPress} error={errors?.cover} />
  );

  const renderContent = ({ field: { onChange, onBlur, value } }: any) => (
    <PostContentInput onChange={onChange} value={value} error={errors?.content} />
  );

  const renderTagList = ({ field: { onChange, onBlur, value } }: any) => (
    <TagList value={value} onChange={onChange} />
  );

  const renderImagesInput = ({ field: { onChange, onBlur, value } }: any) => (
    <ImageInput value={value} onChange={onChange} />
  );

  const renderImageGrid = ({ field: { onChange, onBlur, value } }: any) => (
    <ImageGrid value={value} onChange={onChange} onPress={onImagePress} />
  );

  const renderRecordingsInput = ({ field: { onChange, onBlur, value } }: any) => (
    <RecordingInput value={value} onChange={onChange} />
  );

  const renderRecordingList = ({ field: { onChange, onBlur, value } }: any) => (
    <RecordingList value={value} onChange={onChange} />
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
