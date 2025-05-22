import { memo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { ImageCover, VideoCover, ImageList } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import { usePagerView } from '@/components/pager-view';
import PostItemMenu from '@/components/post-menu-popover';
import { TagList } from '@/components/tag-input';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CommentIcon } from '@/features/comment/components/comment-icon';
import { LastCommentItem } from '@/features/comment/components/last-comment-item';
import { UserAvatars } from '@/features/user/components/user-avatars';
import { UserAvatar } from '@/features/user/components/user-avater';
import useCoverDimensions from '@/hooks/use-cover-dimensions';
import { formatDistance } from '@/utils/date';
import { isImage, isVideo } from '@/utils/file';

export const PostItem: React.FC<any> = memo(({ item }) => {
  useEffect(() => console.log('@render PostItem'));

  const router = useRouter();
  const { coverWidth, coverHeight } = useCoverDimensions(14, 10.5);
  const { setPages, onOpenPage } = usePagerView();

  const onCoverPress = () => {
    setPages(item.album);
    onOpenPage(0);
  };

  const onImagePress = (index: number) => {
    setPages(item.album);
    onOpenPage(index + (item.cover ? 1 : 0));
  };

  return (
    <Pressable onPress={() => router.push(`/posts/${item.documentId}`)}>
      <Card size="sm" className="mt-6 rounded-lg">
        <VStack space="lg">
          <VStack space="sm">
            <HStack className="items-center justify-between">
              <UserAvatar user={item.author} />
              <PostItemMenu post={item} />
            </HStack>
            <Heading numberOfLines={1} ellipsizeMode="tail" bold={true}>
              {item.title}
            </Heading>
            <HStack className="items-center justify-between">
              <Text size="xs">{formatDistance(item.publishDate)}</Text>
              <HStack space="xs" className="w-1/2 items-center justify-end">
                {item.poi?.address && (
                  <HStack className="items-center">
                    <Icon as={MapPin} size="xs" />
                    <Text size="xs" numberOfLines={1}>
                      {item.poi.address}
                    </Text>
                  </HStack>
                )}
              </HStack>
            </HStack>
            <TagList tags={item.tags || []}></TagList>
          </VStack>
          {item.cover && isImage(item.cover.mime) && (
            <ImageCover
              item={item}
              width={coverWidth}
              height={coverHeight}
              onPress={onCoverPress}
            />
          )}
          {item.cover && isVideo(item.cover.mime) && (
            <VideoCover
              item={item}
              width={coverWidth}
              height={coverHeight}
              onPress={onCoverPress}
            />
          )}
          <Text numberOfLines={5}>{item.content}</Text>
          <ImageList value={item.attachmentList} onPress={onImagePress} />
          <HStack className="h-6 items-center justify-between">
            <LikeButton post={item} />
            <UserAvatars users={item.likedByUsers} />
          </HStack>
          <VStack space="sm">
            <HStack className="items-center justify-end">
              <CommentIcon post={item} />
            </HStack>
            {item.lastComment && <LastCommentItem item={item.lastComment} />}
          </VStack>
        </VStack>
      </Card>
    </Pressable>
  );
});
