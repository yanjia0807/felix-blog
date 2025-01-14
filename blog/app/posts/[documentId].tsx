import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { apiServerURL } from '@/api';
import { fetchPost } from '@/api/post';
import AuthorInfo from '@/components/author-info';
import { CommentInput } from '@/components/comment-input';
import { ImageList } from '@/components/image-input';
import { LikeButton } from '@/components/like-button';
import { RecordingList } from '@/components/recording-list';
import { ShareButton } from '@/components/share-button';
import { TagList } from '@/components/tag-input';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatDistance } from '@/utils/date';

const PostCover = ({ cover }: any) => {
  return (
    <Box className="h-36 flex-1">
      <Image
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
        }}
        source={{
          uri: `${apiServerURL}/${cover.formats.small.url}`,
        }}
        alt={cover.alternativeText}
      />
    </Box>
  );
};

const PostDetail = () => {
  const { documentId } = useLocalSearchParams();
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [isGalleryPreviewOpen, setIsGalleryPreviewOpen] = useState(false);

  const {
    isPending,
    isError,
    isSuccess,
    data: post,
    error,
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
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
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
      {isPending && <Spinner className="absolute bottom-0 left-0 right-0 top-0 z-50"></Spinner>}
      {isSuccess && (
        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
          <VStack className="flex-1" space="xl">
            <VStack space="sm">
              <Heading size="lg">{post.title}</Heading>
              <TagList tags={post?.tags} />
              <HStack className="items-center justify-between">
                <AuthorInfo author={post?.author} />
                <HStack space="md" className="items-center justify-end">
                  <LikeButton post={post} />
                  <CommentInput postDocumentId={post?.documentId} count={post?.comments?.count} />
                </HStack>
              </HStack>
              <HStack className="items-center justify-between">
                <Text size="sm">{formatDistance(post?.createdAt)}</Text>
                {post.poi?.address && (
                  <HStack className="items-center">
                    <Icon as={MapPin} size="xs" />
                    <Text size="xs" className="flex-wrap">
                      {post.poi.address}
                    </Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
            <VStack space="sm">
              {post?.cover && (
                <Box className="h-36 flex-1">
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 8,
                    }}
                    source={{
                      uri: `${apiServerURL}/${post.cover.formats.medium.url || post.cover.url}`,
                    }}
                    alt={post.cover.alternativeText}
                  />
                </Box>
              )}
              <ImageList images={images} onOpenGallery={(index: number) => onOpenGallery(index)} />
              <RecordingList recordings={recordings} />
            </VStack>
            <Text size="lg">{post?.content}</Text>
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

export default PostDetail;
