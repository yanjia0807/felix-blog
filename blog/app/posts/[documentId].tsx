import { TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useFetchPost } from '@/api/post';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { VStack } from '@/components/ui/vstack';
import { Card } from '@/components/ui/card';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Box } from '@/components/ui/box';
import { baseURL } from '@/api';
import moment from 'moment';
import { HStack } from '@/components/ui/hstack';
import { BookMarked, Share2 } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import CommentInfo from '@/components/comment-info';
import HeartInfo from '@/components/heart-info';
import AuthorInfo from '@/components/author-info';
import TagBtn from '@/components/tag-btn';
import GalleryPreview from 'react-native-gallery-preview';
import { Pressable } from '@/components/ui/pressable';
import RecordingBtn from '@/components/recording-btn';
import useCustomToast from '@/components/use-custom-toast';

const PostDetail = () => {
  const { documentId } = useLocalSearchParams();
  const toast = useCustomToast();
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const [galleryPreviewIsOpen, setGalleryPreviewIsOpen] = useState(false);
  const { isPending, isError, isSuccess, data: post, error } = useFetchPost(documentId as string);

  if (isError) {
    toast.error(error.message);
  }

  const handleOpenGallery = async (index: number) => {
    setInitialIndex(index);
    setGalleryPreviewIsOpen(true);
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <Pressable className="m-1 h-48 w-48" onPress={() => handleOpenGallery(index)}>
        <Image
          source={{
            uri: `${baseURL}/${item.small.url}`,
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

  const files = post?.blocks?.find(
    (item: any) => item['__component'] === 'shared.attachment',
  )?.files;

  const images = files
    ?.filter((item: any) => item.mime.startsWith('image/'))
    .map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      small: item.formats.small,
    }));
  const cover = images && images[0];

  const recordings = files?.filter((item: any) => item.mime.startsWith('audio/'));
  const content = post?.content;
  const author = post?.author;
  const publishedAt = post && moment(post.publishedAt).format('YYYY-MM-DD h:mm:ss');
  const tags = post?.tags;

  return (
    <>
      {images?.length > 1 && (
        <GalleryPreview
          images={images || []}
          initialIndex={initialIndex}
          isVisible={galleryPreviewIsOpen}
          onRequestClose={() => setGalleryPreviewIsOpen(false)}
        />
      )}
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: () => (
            <Button
              size="sm"
              variant="link"
              onPress={() => {
                router.dismiss();
              }}>
              <ButtonText>返回</ButtonText>
            </Button>
          ),
        }}
      />
      {isPending && <Spinner className="absolute bottom-0 left-0 right-0 top-0 z-50"></Spinner>}
      {isSuccess && (
        <Card className="flex-1 p-4">
          <VStack space="md">
            {cover ? (
              <Box className="h-48 w-full">
                <Image
                  source={{
                    uri: `${baseURL}/${cover.small.url}`,
                  }}
                  alt={cover.alternativeText}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 12,
                  }}
                />
                <TouchableOpacity className="absolute -bottom-4 right-16 h-8 w-8 items-center justify-center rounded-full bg-secondary-500 drop-shadow-xl">
                  <Icon size="md" className="text-secondary-0" as={BookMarked} />
                </TouchableOpacity>
                <TouchableOpacity className="absolute -bottom-4 right-4 h-8 w-8 items-center justify-center rounded-full bg-secondary-500 drop-shadow-xl">
                  <Icon size="md" className="text-secondary-0" as={Share2} />
                </TouchableOpacity>
              </Box>
            ) : (
              <HStack className="items-center justify-end" space="md">
                <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-full bg-secondary-500 drop-shadow-xl">
                  <Icon size="md" className="text-secondary-0" as={BookMarked} />
                </TouchableOpacity>
                <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-full bg-secondary-500 drop-shadow-xl">
                  <Icon size="md" className="text-secondary-0" as={Share2} />
                </TouchableOpacity>
              </HStack>
            )}

            <HStack space="md">
              <Text size="sm"> {publishedAt}</Text>
            </HStack>
            <HStack className="items-center justify-between">
              <AuthorInfo author={author} />
              <HStack space="lg" className="flex-row items-center">
                <HeartInfo />
                <CommentInfo />
              </HStack>
            </HStack>
            {tags.length > 0 && (
              <HStack space="sm" className="flex-wrap">
                {tags.map((item: any) => (
                  <TagBtn key={item.id} tag={item} />
                ))}
              </HStack>
            )}
            {recordings?.length > 0 && (
              <HStack space="sm" className="my-2 flex-wrap">
                {recordings.map((recording: any) => {
                  return <RecordingBtn key={recording.id} uri={`${baseURL}/${recording.url}`} />;
                })}
              </HStack>
            )}
            {images?.length > 1 && (
              <FlashList
                data={images.slice(1)}
                keyExtractor={(item: any) => item.id}
                horizontal={true}
                renderItem={renderItem}
                estimatedItemSize={200}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            )}
            <Text size="sm">{content}</Text>
          </VStack>
        </Card>
      )}
    </>
  );
};

export default PostDetail;
