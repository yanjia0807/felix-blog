import { CarouselProvider, useCarousel } from '@/components/carousel-provider';
import CarouselViewer from '@/components/carousel-viewer';
import { ImageryItem } from '@/components/imagery-item';
import { ImageryList } from '@/components/imagery-list';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { CommentIcon } from '@/features/comment/components/comment-icon';
import { CommentSheet } from '@/features/comment/components/comment-sheet';
import { CommentSheetProvider } from '@/features/comment/components/comment-sheet-provider';
import { useFetchPost } from '@/features/post/api/use-fetch-post';
import { LikeButton } from '@/features/post/components/like-button';
import { PostContextMenu } from '@/features/post/components/post-context-menu';
import { PostDetailSkeleton } from '@/features/post/components/post-detail-skeleton';
import { PostEditMenu } from '@/features/post/components/post-edit-menu';
import useCoverDimensions from '@/features/post/hooks/use-cover-dimensions';
import { TagList } from '@/features/tag/components/tag-list';
import { UserAvatar } from '@/features/user/components/user-avatar';
import { formatDistance } from '@/utils/date';
import { toAttachmetItem } from '@/utils/file';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import _ from 'lodash';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { ScrollView } from 'react-native';

const PostDetail: React.FC<any> = () => {
  const { documentId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const { onOpen } = useCarousel();
  const { coverWidth, coverHeight } = useCoverDimensions(14);
  const postQuery = useFetchPost({ documentId });

  const post = postQuery.data && {
    ...postQuery.data,
    cover: toAttachmetItem(postQuery.data.cover, postQuery.data.attachmentExtras),
    imageries: _.map(postQuery.data.attachments || [], (attachment: any) =>
      toAttachmetItem(attachment, postQuery.data.attachmentExtras),
    ),
  };

  const carouselData = post && _.concat([post.cover], post.imageries || []);

  const onCoverPress = () => onOpen(carouselData, 0);

  const onImagePress = (index: number) => onOpen(carouselData, index + (post.cover ? 1 : 0));

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <HStack space="md" className="items-center justify-center">
      {user?.documentId === post.author.documentId && (
        <PostEditMenu documentId={documentId} isPublished={post?.isPublished} />
      )}
      {!!user && <PostContextMenu documentId={documentId} />}
    </HStack>
  );

  if (postQuery.data) {
    return (
      <SafeAreaView className="flex-1">
        <Stack.Screen
          options={{
            title: post.title,
            headerShown: true,
            headerLeft: renderHeaderLeft,
            headerRight: renderHeaderRight,
          }}
        />
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <VStack space="md">
            <ImageryItem
              uri={post.cover.thumbnail}
              cacheKey={post.cover.name}
              mime={post.cover.mime}
              alt={post.cover.alternativeText || post.cover.name}
              onPress={onCoverPress}
              style={{
                width: coverWidth,
                height: coverHeight,
              }}
              className="rounded-md"
            />
            <HStack className="items-center" space="sm">
              {!post.isPublished && (
                <Text size="sm" sub={true} className="text-gray-400">
                  [未发布]
                </Text>
              )}
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
                <CommentIcon postDocumentId={post.documentId} commentCount={post.comments.count} />
              </HStack>
            </HStack>
            <TagList value={post.tags} readonly={true} />
            <ImageryList value={post.imageries} onPress={onImagePress} />
            <Divider />
            <Text size="md">{post.content}</Text>
            <Divider />
            <HStack className="items-center justify-end">
              <HStack space="md" className="items-center justify-end">
                <LikeButton post={post} />
                <CommentIcon postDocumentId={post.documentId} commentCount={post.comments.count} />
              </HStack>
            </HStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return <PostDetailSkeleton />;
};

const PostDetailLayout: React.FC = () => {
  return (
    <CarouselProvider>
      <CommentSheetProvider>
        <PostDetail />
        <CarouselViewer />
        <CommentSheet />
      </CommentSheetProvider>
    </CarouselProvider>
  );
};

export default PostDetailLayout;
