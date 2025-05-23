import React, { memo } from 'react';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { usePreferences } from '@/components/preferences-provider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { UserAvatar } from '@/features/user/components/user-avater';
import { isImage } from '@/utils/file';
import { ImageCover } from './image-cover';
import { LikeButton } from './like-button';
import { VideoCover } from './video-cover';
import useExploreItemDimensions from '../hooks/use-explore-item-dimensions';

export const ExploreItem: React.FC<any> = memo(({ item, columnIndex }) => {
  const { theme } = usePreferences();
  const router = useRouter();

  const { itemWidth, itemHeight } = useExploreItemDimensions({
    containerPadding: undefined,
    itemSpacing: undefined,
    attachment: item.cover,
  });

  return (
    <Pressable onPress={() => router.push(`/posts/${item.documentId}`)} pointerEvents="box-only">
      <VStack
        space="sm"
        style={{
          margin: 7,
          marginLeft: columnIndex === 0 ? 0 : 7,
          marginRight: columnIndex === 1 ? 0 : 7,
        }}>
        <View className="flex-1 items-center justify-end">
          {isImage(item.cover.mime) ? (
            <ImageCover item={item} width={itemWidth} height={itemHeight} />
          ) : (
            <VideoCover item={item} width={itemWidth} height={itemHeight} />
          )}
          <View className="absolute w-full items-center justify-between">
            <BlurView
              intensity={10}
              tint={theme === 'light' ? 'light' : 'dark'}
              style={{ borderRadius: 8 }}>
              <HStack className="w-full items-center justify-end px-2">
                <LikeButton post={item} />
              </HStack>
            </BlurView>
          </View>
        </View>
        <VStack space="sm">
          <Heading numberOfLines={2}>{item.title}</Heading>
          <HStack className="items-center">
            <UserAvatar user={item.author} size="xs" />
          </HStack>
        </VStack>
      </VStack>
    </Pressable>
  );
});
