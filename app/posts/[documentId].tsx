import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, MapPin, StickyNote } from 'lucide-react-native';
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
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatDistance } from '@/utils/date';

const PostDetail: React.FC = () => {
  const { documentId, status } = useLocalSearchParams();
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isGalleryPreviewOpen, setIsGalleryPreviewOpen] = useState(false);

  const {
    isLoading,
    isSuccess,
    data: post,
  } = useQuery({
    queryKey: [
      'posts',
      'detail',
      {
        documentId,
        status,
      },
    ],
    queryFn: () => fetchPost({ documentId, status }),
  });

  const cover = post?.cover
    ? {
        ...post.cover,
        uri: `${apiServerURL}${post.cover.formats?.large?.url || post.cover.url}`,
        largeUri: `${apiServerURL}${post.cover.formats?.large?.url || post.cover.url}`,
      }
    : undefined;

  const images = _.map(
    _.find(post?.attachments || [], { type: 'image' })?.files || [],
    (item: any) => ({
      ...item,
      uri: `${apiServerURL}${item.formats?.thumbnail.url}`,
      largeUri: `${apiServerURL}${item.formats?.large?.url || item.url}`,
    }),
  );

  const galleryImages: any = _.concat(
    [],
    cover
      ? {
          ...cover,
          uri: cover.largeUri || cover.uri,
        }
      : [],
    images
      ? images.map((item: any) => ({
          ...item,
          uri: item.largeUri || item.uri,
        }))
      : [],
  );

  const recordings = _.map(
    _.find(post?.attachments || [], { type: 'audio' })?.files || [],
    (item: any) => ({
      ...item,
      uri: `${apiServerURL}${item.url}`,
    }),
  );

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
          <VStack className="flex-1 p-4" space="lg">
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Heading size="lg" className="flex-1">
                  {post.title}
                </Heading>
                {status === 'draft' && (
                  <HStack className="items-center" space="xs">
                    <Icon as={StickyNote} size="sm" />
                    <Text size="sm" className="text-gray-400">
                      未发布
                    </Text>
                  </HStack>
                )}
              </HStack>
              <TagList value={post.tags} readonly={true} />
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
              {cover && (
                <Pressable className="h-36 flex-1" onPress={() => onOpenGallery(0)}>
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 8,
                    }}
                    source={{
                      uri: cover.uri,
                    }}
                    alt={cover.alternativeText}
                  />
                </Pressable>
              )}
              <ImageList
                value={images}
                onOpenGallery={(index: number) => onOpenGallery(index + (cover ? 1 : 0))}
              />
              <RecordingList value={recordings} readonly={true} />
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
        images={galleryImages}
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
