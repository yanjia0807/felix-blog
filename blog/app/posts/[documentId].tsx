import BottomSheet from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import GalleryPreview from 'react-native-gallery-preview';
import { apiServerURL } from '@/api';
import { fetchPostCommentTotal } from '@/api/comment';
import { fetchPost } from '@/api/post';
import AuthorInfo from '@/components/author-info';
import BookMarkedButton from '@/components/book-marked-button';
import CommentInfo from '@/components/comment-info';
import LikePostButton from '@/components/like-post-button';
import PostCommentsSheet from '@/components/post-comments-sheet';
import PostRecordings from '@/components/post-recordings';
import PostTags from '@/components/post-tags';
import ShareButton from '@/components/share-button';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const PostDetailCover = ({ cover }: any) => {
  if (cover) {
    return (
      <Box className="h-48 w-full">
        <Image
          source={{
            uri: `${apiServerURL}/${cover.formats.small.url}`,
          }}
          alt={cover.alternativeText}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 12,
          }}
        />
      </Box>
    );
  }
};

const DateInfo = ({ createdAt }: any) => {
  const format = 'YYYY-MM-DD hh:mm:ss';
  const content = `发布于：${moment(createdAt).format(format)}`;
  return (
    <Text size="sm" bold={true}>
      {content}
    </Text>
  );
};

const ImageList = ({ images, onOpenGallery }: any) => {
  const renderImageItem = ({ item, index }: any) => {
    return (
      <Pressable className="mx-2 h-48 w-48" onPress={() => onOpenGallery(index)}>
        <Image
          source={{
            uri: item.uri,
          }}
          alt={item.alternativeText}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 12,
          }}
        />
      </Pressable>
    );
  };

  if (images?.length > 0) {
    return (
      <FlashList
        data={images}
        keyExtractor={(item: any) => item.documentId}
        horizontal={true}
        renderItem={renderImageItem}
        estimatedItemSize={200}
        showsHorizontalScrollIndicator={false}
      />
    );
  }
};

const PostDetail = () => {
  const { documentId } = useLocalSearchParams();
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [galleryPreviewIsOpen, setGalleryPreviewIsOpen] = useState(false);
  const commentsSheetRef = useRef<BottomSheet>();

  const {
    isPending,
    isError,
    isSuccess,
    data: post,
    error,
  } = useQuery({
    queryKey: ['posts', documentId],
    queryFn: () => fetchPost({ documentId }),
  });

  const { data: total } = useQuery<any>({
    queryKey: ['comments', documentId, 'total'],
    queryFn: () => fetchPostCommentTotal({ postDocumentId: documentId }),
  });

  const files = post?.blocks?.find(
    (item: any) => item['__component'] === 'shared.attachment',
  )?.files;

  const images = files
    ?.filter((item: any) => item.mime.startsWith('image/'))
    .map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      uri: `${apiServerURL}${item.formats.small.url}`,
    }));

  const recordings = files?.filter((item: any) => item.mime.startsWith('audio/'));

  const onOpenGallery = async (index: number) => {
    setInitialIndex(index);
    setGalleryPreviewIsOpen(true);
  };

  const renderHeaderLeft = () => (
    <Button
      variant="link"
      size="md"
      onPress={() => {
        router.dismiss();
      }}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const renderHeaderRight = () => (
    <>
      <BookMarkedButton
        post={post}
        className="mr-2 h-8 w-8 items-center justify-center rounded-full drop-shadow-xl"
      />
      <ShareButton className="h-8 w-8 items-center justify-center rounded-full drop-shadow-xl" />
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-100">
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
            <Heading>{post.title}</Heading>
            <PostDetailCover cover={post?.cover} post={post} />
            <PostTags tags={post?.tags} />
            <DateInfo createdAt={post?.createdAt} />
            <HStack className="items-center justify-between">
              <AuthorInfo author={post?.author} />
              <HStack space="lg" className="flex-row items-center">
                <LikePostButton post={post} />
                <CommentInfo />
              </HStack>
            </HStack>
            <PostRecordings recordings={recordings} />
            <ImageList images={images} onOpenGallery={onOpenGallery} />
            <Text size="md">{post?.content}</Text>
            <HStack>
              <Button variant="link" onPress={() => commentsSheetRef.current?.expand()}>
                <ButtonText className="font-bold">{`评论(${total})`}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ScrollView>
      )}
      <PostCommentsSheet postDocumentId={post?.documentId} ref={commentsSheetRef} />
      <GalleryPreview
        images={images || []}
        initialIndex={initialIndex}
        isVisible={galleryPreviewIsOpen}
        onRequestClose={() => setGalleryPreviewIsOpen(false)}
      />
    </SafeAreaView>
  );
};

export default PostDetail;
