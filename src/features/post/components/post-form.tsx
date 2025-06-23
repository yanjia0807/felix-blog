import { useCarousel } from '@/components/carousel-provider';
import { ImageryGrid } from '@/components/imagery-grid';
import { ImageryPicker } from '@/components/imagery-picker';
import { PositionPicker } from '@/components/position-picker';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { TagList } from '@/features/tag/components/tag-list';
import _ from 'lodash';
import React from 'react';
import { Controller } from 'react-hook-form';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';
import { CoverPicker } from './cover-picker';
import { MAX_CHARS, PostContentInput } from './post-content-input';
import { PostTitleInput } from './post-title-input';

export type PostSchema = z.infer<typeof postSchema>;

export const postSchema = z.object({
  id: z.number().optional(),
  documentId: z.string().optional(),
  author: z.string({
    required_error: '作者是必填项',
  }),
  title: z
    .string({
      required_error: '标题是必填项',
    })
    .min(2, '标题不能少于2个字符')
    .max(200, '标题不能超过200个字符'),
  content: z.string().max(MAX_CHARS, `内容最多不能超过${MAX_CHARS}个字符`).optional(),
  cover: z.unknown().refine((val) => val !== null && val !== undefined, {
    message: '封面是必填项',
  }),
  poi: z.unknown(),
  imageries: z.unknown(),
  tags: z.unknown(),
  isPublished: z.boolean(),
  attachments: z.unknown(),
  attachmentExtras: z.unknown(),
});

const PostForm: React.FC<any> = ({ form }) => {
  const insets = useSafeAreaInsets();
  const { onOpen } = useCarousel();

  const {
    control,
    watch,
    formState: { errors },
  } = form;

  const formData: any = watch();

  const onCoverPress = () => onOpen(_.concat(formData?.cover || [], formData?.imageries || []), 0);

  const onImageryPress = (index: number) =>
    onOpen(
      _.concat(formData?.cover || [], formData?.imageries || []),
      index + (formData?.cover ? 1 : 0),
    );

  const renderTitle = ({ field: { onChange, onBlur, value } }: any) => (
    <PostTitleInput onChange={onChange} value={value} error={errors?.title} control={control} />
  );

  const renderCover = ({ field: { onChange, onBlur, value } }: any) => (
    <CoverPicker value={value} onChange={onChange} onPress={onCoverPress} error={errors?.cover} />
  );

  const renderContent = ({ field: { onChange, onBlur, value } }: any) => (
    <PostContentInput onChange={onChange} value={value} error={errors?.content} />
  );

  const renderTagList = ({ field: { onChange, onBlur, value } }: any) => (
    <TagList value={value} onChange={onChange} />
  );

  const renderImageryInput = ({ field: { onChange, onBlur, value } }: any) => (
    <ImageryPicker value={value} onChange={onChange} />
  );

  const renderImageryGrid = ({ field: { onChange, onBlur, value } }: any) => (
    <ImageryGrid value={value} onChange={onChange} onPress={onImageryPress} />
  );

  const renderPosition = ({ field: { onChange, onBlur, value } }: any) => (
    <PositionPicker value={value} onChange={onChange} />
  );

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
          <Controller control={control} name="imageries" render={renderImageryGrid} />
        </VStack>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }}>
        <HStack space="md" className="w-full bg-background-100 px-4">
          <Controller control={control} name="imageries" render={renderImageryInput} />
        </HStack>
      </KeyboardStickyView>
    </>
  );
};

export default PostForm;
