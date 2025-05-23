import React, { memo } from 'react';
import { MapPin } from 'lucide-react-native';
import PageSpinner from '@/components/page-spinner';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CommentIcon } from '@/features/comment/components/comment-icon';
import { ImageList } from '@/features/image/components/image-list';
import { usePagerView } from '@/features/image/components/pager-view-provider';
import { ImageCover } from '@/features/post/components/image-cover';
import { LikeButton } from '@/features/post/components/like-button';
import { VideoCover } from '@/features/post/components/video-cover';
import useCoverDimensions from '@/features/post/hooks/use-cover-dimensions';
import { RecordingList } from '@/features/recording/components/recording-list';
import { TagList } from '@/features/tag/components/tag-list';
import { UserAvatar } from '@/features/user/components/user-avater';
import { formatDistance } from '@/utils/date';
import { isImage, isVideo } from '@/utils/file';

export const PostDetailSkeleton: React.FC<any> = () => {
  const { coverWidth, coverHeight } = useCoverDimensions(14);

  return (
    <>
      <PageSpinner />
      <VStack className="flex-1 p-4" space="lg">
        <Skeleton variant="rounded" style={{ width: coverWidth, height: coverHeight }} />
        <SkeletonText _lines={1} className="h-4 w-96" />
        <SkeletonText _lines={1} className="h-3 w-24" />
        <HStack className="items-center justify-between">
          <HStack className="w-24 items-center" space="xs">
            <Skeleton variant="circular" className="h-8 w-8" />
            <SkeletonText _lines={1} className="h-4" />
          </HStack>
          <Skeleton variant="sharp" className="h-4 w-24" />
        </HStack>
        <HStack className="items-center" space="sm">
          <Skeleton variant="rounded" className="h-14 w-14" />
          <Skeleton variant="rounded" className="h-14 w-14" />
        </HStack>
        <SkeletonText _lines={3} className="h-3" />
      </VStack>
    </>
  );
};

export const PostDetailItem: React.FC<any> = memo(({ post }) => {
  const { onOpenPage } = usePagerView();
  const { coverWidth, coverHeight } = useCoverDimensions(14);

  const onCoverPress = () => onOpenPage(0);

  const onImagePress = (index: number) => onOpenPage(index + (post.cover ? 1 : 0));

  return (
    <>
      {post.cover && isImage(post.cover.mime) && (
        <ImageCover item={post} width={coverWidth} height={coverHeight} onPress={onCoverPress} />
      )}
      {post.cover && isVideo(post.cover.mime) && (
        <VideoCover item={post} width={coverWidth} height={coverHeight} onPress={onCoverPress} />
      )}
      <HStack className="items-center justify-between" space="xl">
        <Heading size="lg" className="flex-1">
          {post.title}
        </Heading>
      </HStack>
      <HStack className="items-center justify-between">
        <Text size="xs">{formatDistance(post?.createdAt)}</Text>
        {post.poi?.address && (
          <HStack className="items-center">
            <Icon as={MapPin} size="xs" />
            <Text size="xs" className="flex-wrap">
              {post.poi.address}
            </Text>
          </HStack>
        )}
      </HStack>
      <HStack className="items-center justify-between">
        <UserAvatar user={post.author} />
        <HStack space="md" className="items-center justify-end">
          <LikeButton post={post} />
          <CommentIcon post={post} />
        </HStack>
      </HStack>
      <TagList value={post.tags} readonly={true} />
      <ImageList value={post.images} onPress={onImagePress} />
      <RecordingList value={post.recordings} readonly={true} />
      <Divider />
      <Text size="lg">{post.content}</Text>
      <Divider />
      <HStack className="items-center justify-end">
        <HStack space="md" className="items-center justify-end">
          <LikeButton post={post} />
          <CommentIcon post={post} />
        </HStack>
      </HStack>
    </>
  );
});
