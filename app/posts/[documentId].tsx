import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import { ScrollView } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { apiServerURL } from '@/api';
import { fetchPost } from '@/api/post';
import { AuthorInfo } from '@/components/auth-context';
import { CommentIcon, CommentProvider, CommentSheet } from '@/components/comment-input';
import { ImageList } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import PageSpinner from '@/components/page-spinner';
import { RecordingList } from '@/components/recording-input';
import { ShareButton } from '@/components/share-button';
import { TagList } from '@/components/tag-input';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatDistance } from '@/utils/date';

const PostDetail: React.FC = () => {
  const { documentId } = useLocalSearchParams();
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isGalleryPreviewOpen, setIsGalleryPreviewOpen] = useState(false);

  const {
    isLoading,
    isSuccess,
    data: post,
  } = useQuery({
    queryKey: ['posts', 'detail', documentId],
    queryFn: () => fetchPost({ documentId }),
  });

  const images = _.map(
    _.find(post?.attachments || [], { type: 'image' })?.files || [],
    (item: any) => ({
      id: item.id,
      assetId: item.documentId,
      alternativeText: item.alternativeText,
      uri: `${apiServerURL}${item.formats?.thumbnail.url || item.url}`,
    }),
  );

  const originImages: any = _.map(
    _.find(post?.attachments || [], { type: 'image' })?.files || [],
    (item: any) => ({
      id: item.id,
      assetId: item.documentId,
      alternativeText: item.alternativeText,
      uri: `${apiServerURL}${item.url}`,
    }),
  );

  const recordings = _.find(post?.attachments || [], { type: 'audio' })?.files || [];

  const onOpenGallery = async (index: number) => {
    setImageIndex(index);
    setIsGalleryPreviewOpen(true);
  };

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <ShareButton className="h-8 w-8 items-center justify-center rounded-full" />
  );

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
          headerRight: renderHeaderRight,
        }}
      />
      <PageSpinner isVisiable={isLoading} />
      {isSuccess && (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
          <VStack className="flex-1 p-4" space="xl">
            <VStack space="sm">
              <Heading size="lg">{post.title}</Heading>
              <TagList tags={post.tags} />
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
                <AuthorInfo author={post.author} />
                <HStack space="md" className="items-center justify-end">
                  <LikeButton post={post} />
                  <CommentIcon item={post} />
                </HStack>
              </HStack>
            </VStack>
            <VStack space="sm">
              {post.cover && (
                <Box className="h-36 flex-1">
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 8,
                    }}
                    source={{
                      uri: `${apiServerURL}${post.cover.formats.medium.url || post.cover.url}`,
                    }}
                    alt={post.cover.alternativeText}
                  />
                </Box>
              )}
              <ImageList images={images} onOpenGallery={(index: number) => onOpenGallery(index)} />
              <RecordingList recordings={recordings} />
            </VStack>
            <Divider />
            <Text size="lg">{post.content}</Text>
            <Divider />
            <HStack className="items-center justify-end">
              <HStack space="md" className="items-center justify-end">
                <LikeButton post={post} />
                <CommentIcon item={post} />
              </HStack>
            </HStack>
          </VStack>
        </ScrollView>
      )}
      <GalleryPreview
        images={originImages}
        initialIndex={imageIndex}
        isVisible={isGalleryPreviewOpen}
        onRequestClose={() => setIsGalleryPreviewOpen(false)}
      />
    </SafeAreaView>
  );
};

const PostDetailPage: React.FC = () => (
  <CommentProvider>
    <PostDetail />
    <CommentSheet />
  </CommentProvider>
);

export default PostDetailPage;
