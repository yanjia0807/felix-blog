import { useCarousel } from '@/components/carousel-provider';
import { ImageryItem } from '@/components/imagery-item';
import { ImageryList } from '@/components/imagery-list';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CommentIcon } from '@/features/comment/components/comment-icon';
import { LastCommentItem } from '@/features/comment/components/last-comment-item';
import { useCommentActions } from '@/features/comment/store';
import PostItemMenu from '@/features/post/components/post-menu-popover';
import useCoverDimensions from '@/features/post/hooks/use-cover-dimensions';
import { TagList } from '@/features/tag/components/tag-list';
import { UserAvatar } from '@/features/user/components/user-avatar';
import { UserAvatars } from '@/features/user/components/user-avatars';
import { formatDistance } from '@/utils/date';
import { useRouter } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import React, { memo } from 'react';
import { Pressable } from 'react-native';
import { LikeButton } from './like-button';

export const PostItem: React.FC<any> = memo(function PostItem({ item }) {
  const router = useRouter();
  const { coverWidth, coverHeight } = useCoverDimensions(14, 10.5);
  const { onOpen } = useCarousel();
  const { setCommentPostDocumentId } = useCommentActions();

  const carouselData = _.concat(item.cover ? item.cover : [], item.images || []);

  const onCoverPress = () => {
    onOpen(carouselData, 0);
  };

  const onImagePress = (index: number) => {
    onOpen(carouselData, index + (item.cover ? 1 : 0));
  };

  const onItemPress = () => {
    setCommentPostDocumentId(item.documentId);
    router.push(`/posts/${item.documentId}`);
  };

  return (
    <Pressable onPress={() => onItemPress()}>
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
          <ImageryItem
            source={{ uri: item.cover.thumbnail }}
            cacheKey={item.cover.name}
            mime={item.cover.mime}
            alt={item.cover.alternativeText || item.cover.name}
            style={{
              width: coverWidth,
              height: coverHeight,
              borderRadius: 6,
            }}
            onPress={onCoverPress}
          />
          <Text numberOfLines={5}>{item.content}</Text>
          <ImageryList value={item.images} onPress={onImagePress} />
          <HStack className="h-6 items-center justify-between">
            <LikeButton post={item} />
            <UserAvatars users={item.likedByUsers} />
          </HStack>
          <VStack space="sm">
            <HStack className="items-center justify-end">
              <CommentIcon postDocumentId={item.documentId} commentCount={item.comments.count} />
            </HStack>
            {item.lastComment && <LastCommentItem item={item.lastComment} />}
          </VStack>
        </VStack>
      </Card>
    </Pressable>
  );
});
