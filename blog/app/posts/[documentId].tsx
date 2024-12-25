import { useQuery } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import moment from 'moment';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { apiServerURL } from '@/api';
import { fetchPost } from '@/api/post';
import AuthorInfo from '@/components/author-info';
import CommentInfo from '@/components/comment-info';
import LikePostButton from '@/components/like-post-button';
import PostCommentsSheet from '@/components/post-comments-sheet';
import PostImageGrid from '@/components/post-images-grid';
import PostRecordings from '@/components/post-recordings';
import PostTags from '@/components/post-tags';
import ShareButton from '@/components/share-button';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const PostCover = ({ cover }: any) => {
  return (
    <Image
      source={{
        uri: `${apiServerURL}/${cover.formats.small.url}`,
      }}
      alt={cover.alternativeText}
      className="h-48 w-full rounded-md"
    />
  );
};

const DateInfo = ({ createdAt }: any) => {
  const format = 'YYYY-MM-DD hh:mm:ss';
  const content = `${moment(createdAt).format(format)}`;
  return <Text size="sm">{content}</Text>;
};

const PostDetail = () => {
  const { documentId } = useLocalSearchParams();
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [isGalleryPreviewOpen, setIsGalleryPreviewOpen] = useState(false);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);

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

  const files = post?.blocks?.find(
    (item: any) => item['__component'] === 'shared.attachment',
  )?.files;

  const images = files
    ?.filter((item: any) => item.mime.startsWith('image/'))
    .map((item: any) => ({
      id: item.id,
      assetId: item.documentId,
      alternativeText: item.alternativeText,
      uri: `${apiServerURL}${item.formats.small.url}`,
    }));

  const recordings = files?.filter((item: any) => item.mime.startsWith('audio/'));

  const onOpenGallery = async (index: number) => {
    setInitialIndex(index);
    setIsGalleryPreviewOpen(true);
  };

  const renderHeaderLeft = () => (
    <Button
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonIcon as={ChevronLeft} />
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
          <VStack className="flex-1" space="md">
            <Heading className="mb-4">{post.title}</Heading>
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <AuthorInfo author={post?.author} />
                <HStack space="lg" className="items-center justify-end">
                  <LikePostButton post={post} />
                  <CommentInfo
                    commentCount={post?.comments?.count}
                    onCommentButtonPressed={() => setIsCommentSheetOpen(true)}
                  />
                </HStack>
              </HStack>
              <HStack className="items-center" space="sm">
                <DateInfo createdAt={post?.createdAt} />
                <Text size="sm">重庆财富中心</Text>
              </HStack>
            </VStack>
            {post?.cover && <PostCover cover={post.cover} />}
            {post?.tags?.length > 0 && <PostTags tags={post?.tags} />}
            {post?.content && <Text>{post?.content}</Text>}
            {recordings?.length > 0 && <PostRecordings recordings={recordings} />}
            {images?.length > 0 && <PostImageGrid images={images} onOpenGallery={onOpenGallery} />}
          </VStack>
        </ScrollView>
      )}
      <PostCommentsSheet
        commentCount={post?.comments?.count}
        postDocumentId={post?.documentId}
        isOpen={isCommentSheetOpen}
        onClose={() => setIsCommentSheetOpen(false)}
      />
      <GalleryPreview
        images={images || []}
        initialIndex={initialIndex}
        isVisible={isGalleryPreviewOpen}
        onRequestClose={() => setIsGalleryPreviewOpen(false)}
      />
    </SafeAreaView>
  );
};

export default PostDetail;
